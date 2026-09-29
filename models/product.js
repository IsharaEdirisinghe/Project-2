import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    altNames: [
        { type: String }
    ],
    description: {
        type: String,
        required: true
    },
    images: [
        { type: String }
    ],
    section: {
        type: String,
        enum: ["Men", "Women", "Accessories"],
        required: true
    },
    gender: {
        type: String,
        enum: ["Men", "Women"],
        required: true
    },
    totalSold: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String
    },
    material: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    sizes: [{
        type: String,
        required: true
    }],
    labelledPrice: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    variants: [
        {
            color: {
                type: String,
                required: true
            },

            size: {
                type: String,
                required: true
            },

            stock: {
                type: Number,
                required: true
            }
        }
    ],
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users"
            },
            orderId: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    averageRating: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        required: true,
        default: false
    },
    isAvailable: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    timestamps: true
});

const Product = mongoose.model("products", productSchema)

export default Product;