import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const frontend_url = "https://food-del-frontend-rb.onrender.com";

// placing user order for frontend
const placeOrder = async (req, res) => {
    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            paymentMethod: req.body.paymentMethod, // "COD" or "Razorpay"
        });
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // COD flow — no payment gateway needed
        if (req.body.paymentMethod === "COD") {
            return res.json({
                success: true,
                message: "Order Placed",
                cod: true,
                orderId: newOrder._id
            });
        }

        // Razorpay flow — use the already-calculated total sent from frontend
        // (previously this was recalculated here with a hardcoded ₹10 delivery fee
        // and no discount/platform fee, causing a mismatch with what the customer saw)
        const options = {
            amount: Math.round(req.body.amount * 100), // in paise
            currency: "INR",
            receipt: newOrder._id.toString()
        };

        const order = await razorpayInstance.orders.create(options);

        res.json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID,
            orderId: newOrder._id,
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const verifyOrder = async (req, res) => {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    try {
        // Previously this trusted a client-sent "success" flag with no verification —
        // anyone could call this route directly and mark any order as paid.
        // Now we verify the Razorpay signature server-side using HMAC.
        if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest("hex");

            if (expectedSignature === razorpay_signature) {
                await orderModel.findByIdAndUpdate(orderId, { payment: true });
                return res.json({ success: true, message: "Paid" });
            }
        }

        // Verification failed or payment was cancelled/dismissed
        await orderModel.findByIdAndDelete(orderId);
        res.json({ success: false, message: "Not Paid" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const updateStatus = async (req, res) => {
    try {
        const order = await orderModel.findById(req.body.orderId);

        const updateFields = { status: req.body.status };

        // For COD orders, mark payment as done once delivered
        if (order.paymentMethod === "COD" && req.body.status === "Delivered") {
            updateFields.payment = true;
        }

        await orderModel.findByIdAndUpdate(req.body.orderId, updateFields);
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
