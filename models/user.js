import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: "customer"
    },
    isBlocked: {
        type: Boolean,
        required: true,
        default: false
    },
    img: {
        type: String,
        required: false,
        default: "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
    },
    phone: {
        type: String,
        required: false,
        default: ""
    },

    address: {
        type: String,
        required: false,
        default: ""
    },

    city: {
        type: String,
        required: false,
        default: ""
    },

    country: {
        type: String,
        required: false,
        default: "Sri Lanka"
    },
    addresses: [
        {
            fullName: {
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

            city: {
                type: String,
                required: true
            },

            postalCode: {
                type: String,
                required: true
            },

            country: {
                type: String,
                required: true,
                default: "Sri Lanka"
            },

            isDefault: {
                type: Boolean,
                default: false
            }
        }
    ],
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products"
        }
    ],
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "products",
                required: true
            },

            quantity: {
                type: Number,
                default: 1,
                min: 1
            },

            size: {
                type: String,
                required: true
            },

            color: {
                type: String,
                required: true
            }
        }
    ],
    recentlyViewed: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products"
        }
    ]

});

const User = mongoose.model("users", userSchema);

export default User;