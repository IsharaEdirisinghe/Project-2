import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "card"],
        default: "cod",
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "pending"
    },
    salesCounted: {
        type: Boolean,
        default: false
    },
    labelledTotal: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        required: true,
        default: 300
    },
    total: {
        type: Number,
        required: true
    },
    products: [
        {
            productInfo: {
                productId: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                altNames: [{
                    type: String
                }],
                description: {
                    type: String,
                    required: true
                },
                images: [{
                    type: String
                }],
                labelledPrice: {
                    type: Number,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                },
                size: {
                    type: String,
                    required: true
                },
                color: {
                    type: String,
                    required: true
                }
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }

},
    {
        timestamps: true
    })

const Order = mongoose.model("orders", orderSchema)
export default Order;