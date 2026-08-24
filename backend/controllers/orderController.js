import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const frontend_url = "http://localhost:5174";

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

        // Razorpay flow (existing logic)
        const line_items = req.body.items.map((item) => ({
            name: item.name,
            amount: item.price * 100,
            quantity: item.quantity
        }));

        line_items.push({
            name: "Delivery Charges",
            amount: 10 * 100,
            quantity: 1
        });

        const totalAmount = line_items.reduce(
            (sum, item) => sum + item.amount * item.quantity,
            0
        );

        const options = {
            amount: totalAmount,
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
    const { orderId, success } = req.body;
    try {
        if (success == "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" });
        }
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