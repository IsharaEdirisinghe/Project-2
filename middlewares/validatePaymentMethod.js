

export default function validatePaymentMethod(req, res, next) {

    const { paymentMethod } = req.body;

    const methods = [
        "cod",
        "card",
        "payhere",
        "stripe"
    ];

    if (!methods.includes(paymentMethod)) {

        return res.status(400).json({

            message: "Invalid payment method"

        });

    }

    next();

}