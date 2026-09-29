export default function validateAddress(req, res, next) {

    const { address, phone } = req.body;

    if (!address || address.trim() === "") {
        return res.status(400).json({
            message: "Address is required"
        });
    }

    if (!phone || phone.trim() === "") {
        return res.status(400).json({
            message: "Phone number is required"
        });
    }

    if (phone.length < 10) {
        return res.status(400).json({
            message: "Invalid phone number"
        });
    }

    next();
}

