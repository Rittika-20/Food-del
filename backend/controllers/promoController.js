const promoCodes = {
    "SK10": 10,
    "SK20": 20,
    "FIRST50": 50,
    "SKRITT60": 60
};

const applyPromo = async (req, res) => {
    try {
        const { code } = req.body;
        const upperCode = code.trim().toUpperCase();

        if (promoCodes[upperCode]) {
            res.json({
                success: true,
                discount: promoCodes[upperCode],
                message: `Promo code applied! ${promoCodes[upperCode]}% off`
            });
        } else {
            res.json({ success: false, message: "Invalid promo code" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

export { applyPromo };