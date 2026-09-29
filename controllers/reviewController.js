import Product from "../models/product.js";

export async function addReview(req, res) {

    try {

        const { productId } = req.params;
        const { rating, comment } = req.body;

        const product = await Product.findOne({ productId });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const alreadyReviewed = product.reviews.find(

            review => review.user.toString() === req.user._id

        );

        if (alreadyReviewed) {
            return res.status(400).json({
                message: "You have already reviewed this product"
            });
        }

        product.reviews.push({

            user: req.user._id,

            rating,

            comment

        });

        let total = 0;

        product.reviews.forEach(review => {

            total += review.rating;

        });

        product.averageRating = total / product.reviews.length;

        await product.save();

        res.status(201).json({

            message: "Review Added Successfully",

            averageRating: product.averageRating

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

}

export async function getReviews(req, res) {

    try {

        const product = await Product.findOne({

            productId: req.params.productId

        }).populate("reviews.user", "firstName lastName img");

        if (!product) {

            return res.status(404).json({

                message: "Product not found"

            });

        }

        res.status(200).json({

            averageRating: product.averageRating,

            totalReviews: product.reviews.length,

            reviews: product.reviews

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

}

export async function updateReview(req, res) {

    try {

        const product = await Product.findOne({

            productId: req.params.productId

        });

        if (!product) {

            return res.status(404).json({

                message: "Product not found"

            });

        }

        const review = product.reviews.find(

            review => review.user.toString() === req.user._id

        );

        if (!review) {

            return res.status(404).json({

                message: "Review not found"

            });

        }

        review.rating = req.body.rating;

        review.comment = req.body.comment;

        let total = 0;

        product.reviews.forEach(item => {

            total += item.rating;

        });

        product.averageRating = total / product.reviews.length;

        await product.save();

        res.json({

            message: "Review Updated",

            averageRating: product.averageRating

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

}

export async function deleteReview(req, res) {

    try {

        const product = await Product.findOne({

            productId: req.params.productId

        });

        if (!product) {

            return res.status(404).json({

                message: "Product not found"

            });

        }

        product.reviews = product.reviews.filter(

            review => review.user.toString() !== req.user._id

        );

        let total = 0;

        product.reviews.forEach(item => {

            total += item.rating;

        });

        if (product.reviews.length > 0) {

            product.averageRating =

                total / product.reviews.length;

        }

        else {

            product.averageRating = 0;

        }

        await product.save();

        res.json({

            message: "Review Deleted"

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

}