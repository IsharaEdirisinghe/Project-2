import Product from "../models/product.js";
import Order from "../models/order.js";
import { isAdmin } from "./userController.js";

export async function getProducts(req, res) {

    try {

        const {
            search,
            section,
            gender,
            sale,
            newArrival,
            category,
            color,
            brand,
            size,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 100
        } = req.query;

        let query = {};

        // User නම් Available products විතරයි
        if (!isAdmin(req)) {
            query.isAvailable = true;
        }
        // Search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { brand: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } }
            ];
        }
        if (sale === "true") {
            query.$expr = {
                $gt: ["$labelledPrice", "$price"]
            };
        }
        if (section && section !== "All") {
            query.section = section;
        }
        // Category
        if (category && category !== "All") {
            query.category = category;
        }
        if (newArrival === "true") {
            query.createdAt = { $exists: true };
        }
        // Color
        if (color && color !== "null") {
            query["variants.color"] = color;
        }
        // Brand
        if (brand) {
            const brands = brand.split(",");
            query.brand = { $in: brands };
        }
        // Size
        if (size && size !== "null") {
            query["variants.size"] = size;
        }
        // Gender
        if (gender) {
            query.gender = gender;
        }
        // Price
        if (minPrice || maxPrice) {

            query.price = {};

            if (minPrice)
                query.price.$gte = Number(minPrice);

            if (maxPrice)
                query.price.$lte = Number(maxPrice);

        }
        let sortQuery = { createdAt: -1 };

        if (sort === "priceAsc") {
            sortQuery = { price: 1 };
        }

        if (sort === "priceDesc") {
            sortQuery = { price: -1 };
        }

        if (sort === "bestSelling") {
            sortQuery = { totalSold: -1 };
        }
        switch (sort) {

            case "priceAsc":
                sortQuery = { price: 1 };
                break;

            case "priceDesc":
                sortQuery = { price: -1 };
                break;

            case "bestSelling":
                sortQuery = { totalSold: -1 };
                break;

            case "highestDiscount":
                sortQuery = { discountPercentage: -1 };
                break;

            case "newest":
                sortQuery = { createdAt: -1 };
                break;

            default:
                sortQuery = { createdAt: -1 };

        }

        // Pagination
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;
        // Total Products
        const totalProducts = await Product.countDocuments(query);
        // Products
        const products = await Product.find(query)
            .skip(skip)
            .limit(limitNumber)
            .sort(sortQuery);

        res.status(200).json({

            products,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalProducts / limitNumber),
            totalProducts,
            hasMore: skip + products.length < totalProducts

        });

    } catch (err) {
        res.status(500).json({
            message: "Failed to get products",
            error: err.message
        });
    }
}

export async function saveProduct(req, res) {

    try {
        if (!isAdmin(req)) {
            return res.status(403).json({
                message: "You are not authorized to add a product"
            });
        }
        console.log("Request Body:", req.body);
        const product = new Product(req.body);
        const savedProduct = await product.save();
        res.status(201).json({
            message: "Product added successfully",
            product: savedProduct
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Failed to add product",
            error: err.message
        });
    }
}

export async function deleteProduct(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({
            message: "You are not authorized to delete a product"
        })
        return
    }
    try {
        await Product.deleteOne({ productId: req.params.productId })

        res.json({
            message: "Product delete successfully"
        })
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete product",
            error: err
        })
    }
}

export async function updateProduct(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({
            message: "You are not authorized to update a product"
        })
        return
    }

    const productId = req.params.productId;
    const updatingData = req.body;

    try {
        await Product.updateOne(
            { productId: productId },
            updatingData
        )

        res.json(
            {
                message: "Product updated successfully"
            }
        )
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            error: err
        })
    }
}

export async function getProductById(req, res) {
    const productId = req.params.productId

    try {
        const product = await Product.findOne(
            { productId: productId }
        )

        if (product == null) {
            res.status(404).json({
                message: "Product not found"
            })
            return
        }
        if (product.isAvailable) {
            res.json(product)
        } else {
            if (!isAdmin(req)) {
                res.status(404).json({
                    message: "Product not found"
                })
                return
            } else {
                res.json(product)
            }
        }

    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            error: err
        })
    }
}

export async function searchProducts(req, res) {
    const searchQuery = req.params.query
    try {
        const products = await Product.find({
            $or: [
                { name: { $regex: searchQuery, $options: "i" } },
                { altNames: { $elemMatch: { $regex: searchQuery, $options: "i" } } }
            ],
            isAvailable: true
        })
        res.json(products)
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            error: err
        })
    }
}

export async function checkStock(req, res) {

    try {

        const productId = req.params.productId;

        const { color, size } = req.query;

        const product = await Product.findOne({
            productId: productId
        });

        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }

        const variant = product.variants.find(

            item => item.color === color &&
                item.size === size

        );

        if (!variant) {

            return res.status(404).json({

                message: "Variant not found"

            });

        }

        res.json({

            stock: variant.stock,

            available: variant.stock > 0

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

}

export async function getAvailableSizes(req, res) {

    try {

        const product = await Product.findOne({

            productId: req.params.productId

        });

        const color = req.query.color;

        const sizes = product.variants.filter(

            item => item.color === color

        );

        res.json(sizes);

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

}

export async function validateVariant(req, res) {

    try {

        const { productId, color, size, quantity } = req.body;

        const product = await Product.findOne({
            productId: productId
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const variant = product.variants.find(
            item =>
                item.color === color &&
                item.size === size
        );

        if (!variant) {
            return res.status(404).json({
                message: "Selected variant not found"
            });
        }

        if (variant.stock < quantity) {
            return res.status(400).json({
                message: "Not enough stock available",
                availableStock: variant.stock
            });
        }

        res.status(200).json({
            message: "Variant available",
            stock: variant.stock
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

}

export async function reduceStock(req, res) {

    try {

        const { productId, color, size, quantity } = req.body;

        const product = await Product.findOne({
            productId: productId
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const variant = product.variants.find(
            item =>
                item.color === color &&
                item.size === size
        );

        if (!variant) {
            return res.status(404).json({
                message: "Variant not found"
            });
        }

        if (variant.stock < quantity) {
            return res.status(400).json({
                message: "Insufficient stock"
            });
        }

        variant.stock -= quantity;

        await product.save();

        res.status(200).json({
            message: "Stock updated successfully",
            remainingStock: variant.stock
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

}

export async function addRecentlyViewed(req, res) {

    try {

        const product = await Product.findOne({
            productId: req.params.productId
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // දැනට තියෙන Product එක remove කරනවා
        user.recentlyViewed = user.recentlyViewed.filter(
            id => id.toString() !== product._id.toString()
        );

        // මුලට add කරනවා
        user.recentlyViewed.unshift(product._id);

        // උපරිම 10ක් විතරක් තියාගන්නවා
        if (user.recentlyViewed.length > 10) {
            user.recentlyViewed.pop();
        }

        await user.save();

        res.json({
            message: "Recently viewed updated"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

}

export async function getRecentlyViewed(req, res) {

    try {

        const user = await User.findById(req.user._id)
            .populate("recentlyViewed");

        res.json(user.recentlyViewed);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

}

export async function getRecommendedProducts(req, res) {
    try {
        const products = await Product.find({
            isAvailable: true
        })
            .sort({
                totalSold: -1,
                createdAt: -1
            })
            .limit(8);

        res.status(200).json(products);

    } catch (error) {
        console.error("Get recommended products error:", error);

        res.status(500).json({
            message: "Failed to load recommended products"
        });
    }
}

// ===============================
// ADD PRODUCT REVIEW
// ===============================

// ===============================
// ADD PRODUCT REVIEW
// ===============================

export async function addReview(req, res) {

    try {

        const productId = req.params.productId;

        const { rating, comment } = req.body;

        // =====================================
        // RATING VALIDATION
        // =====================================

        const reviewRating = Number(rating);

        if (
            !reviewRating ||
            reviewRating < 1 ||
            reviewRating > 5
        ) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        // =====================================
        // FIND PRODUCT
        // =====================================

        const product = await Product.findOne({
            productId: productId
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // =====================================
        // FIND DELIVERED ORDERS
        // =====================================

        const deliveredOrders = await Order.find({
            email: req.user.email,
            status: "delivered"
        });

        let purchasedOrder = null;

        for (let i = 0; i < deliveredOrders.length; i++) {

            const order = deliveredOrders[i];

            for (let j = 0; j < order.products.length; j++) {

                const orderProduct =
                    order.products[j];

                // Check whether this delivered order
                // contains the product
                if (
                    orderProduct.productInfo.productId ===
                    productId
                ) {

                    // Check whether this order
                    // already has a review
                    const alreadyReviewed =
                        product.reviews.some(
                            review =>
                                review.orderId ===
                                order.orderId
                        );

                    // If this order has NOT been reviewed,
                    // use this order
                    if (!alreadyReviewed) {

                        purchasedOrder = order;

                        break;
                    }
                }
            }

            // Stop when we find an unreviewed order
            if (purchasedOrder) {
                break;
            }
        }

        // =====================================
        // CUSTOMER DID NOT PURCHASE PRODUCT
        // =====================================

        if (!purchasedOrder) {

            return res.status(403).json({
                message:
                    "You can review this product only after your order has been delivered"
            });

        }

        // =====================================
        // CHECK WHETHER THIS ORDER
        // ALREADY HAS A REVIEW
        // =====================================

        console.log("================================");
        console.log("Current Product:", productId);
        console.log("Purchased Order:", purchasedOrder.orderId);

        console.log(
            "Existing Reviews:",
            product.reviews.map(review => ({
                orderId: review.orderId,
                user: review.user?.toString(),
                rating: review.rating,
                comment: review.comment
            }))
        );

        console.log(
            "Checking Order ID:",
            purchasedOrder.orderId
        );



        // =====================================
        // ADD NEW REVIEW
        // =====================================

        product.reviews.push({

            user: req.user._id,

            orderId: purchasedOrder.orderId,

            rating: reviewRating,

            comment: comment || ""

        });

        // =====================================
        // CALCULATE AVERAGE RATING
        // =====================================

        const totalRating = product.reviews.reduce(
            (sum, review) =>
                sum + review.rating,
            0
        );

        product.averageRating =
            totalRating /
            product.reviews.length;

        // =====================================
        // SAVE PRODUCT
        // =====================================

        await product.save();

        // =====================================
        // GET UPDATED PRODUCT
        // =====================================

        const updatedProduct =
            await Product.findOne({
                productId: productId
            }).populate(
                "reviews.user",
                "firstName lastName"
            );

        // =====================================
        // GET THE NEW REVIEW
        // =====================================

        const newReview =
            updatedProduct.reviews[
            updatedProduct.reviews.length - 1
            ];

        // =====================================
        // RESPONSE
        // =====================================

        res.status(201).json({

            message:
                "Review added successfully",

            review:
                newReview,

            averageRating:
                updatedProduct.averageRating,

            reviewCount:
                updatedProduct.reviews.length

        });

    } catch (err) {

        console.error(
            "Add review error:",
            err
        );

        res.status(500).json({

            message:
                "Failed to add review",

            error:
                err.message

        });

    }

}


// ===============================
// GET PRODUCT REVIEWS
// ===============================

export async function getProductReviews(req, res) {

    try {

        const productId = req.params.productId;

        const product = await Product.findOne({
            productId: productId
        })
            .populate(
                "reviews.user",
                "firstName lastName"
            )
            .select("reviews averageRating");

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            reviews: product.reviews,
            averageRating: product.averageRating,
            reviewCount: product.reviews.length
        });

    } catch (err) {

        console.error("Get reviews error:", err);

        res.status(500).json({
            message: "Failed to get reviews",
            error: err.message
        });

    }

}