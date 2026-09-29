import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({

    product: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "products"

    },

    user: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "users"

    },

    rating: Number,

    comment: String

},
    {

        timestamps: true

    });

export default mongoose.model("reviews",reviewSchema);