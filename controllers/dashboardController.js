import Product from "../models/product.js";
import User from "../models/user.js";
import Order from "../models/order.js";
import Review from "../models/review.js";

export async function getDashboardStats(req, res) {

    try {

        // Total Products
        const totalProducts = await Product.countDocuments();

        // Total Users
        const totalUsers = await User.countDocuments();

        // Total Orders
        const totalOrders = await Order.countDocuments();

        // Pending Orders
        const pendingOrders = await Order.countDocuments({
            status: "Pending"
        });

        // Delivered Orders
        const deliveredOrders = await Order.countDocuments({
            status: "Delivered"
        });

        // Revenue
        const revenue = await Order.aggregate([
            {
                $match: {
                    status: "Delivered"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$total"
                    }
                }
            }
        ]);

        res.status(200).json({

            totalProducts,

            totalUsers,

            totalOrders,

            pendingOrders,

            deliveredOrders,

            totalRevenue:
                revenue.length > 0
                    ? revenue[0].totalRevenue
                    : 0

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

}

export async function getTopSellingProducts(req, res) {

    try {

        const topProducts = await Order.aggregate([

            {
                $unwind: "$products"
            },

            {
                $group: {

                    _id: "$products.productInfo.productId",

                    name: {
                        $first: "$products.productInfo.name"
                    },

                    image: {
                        $first: "$products.productInfo.images"
                    },

                    totalSold: {
                        $sum: "$products.quantity"
                    }

                }
            },

            {
                $sort: {
                    totalSold: -1
                }
            },

            {
                $limit: 5
            }

        ])

        res.status(200).json(topProducts)

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        })

    }

}

export async function getMonthlySales(req, res) {

    try {

        const monthlySales = await Order.aggregate([

            {
                $match: {
                    status: "Delivered"
                }
            },

            {
                $group: {

                    _id: {
                        month: {
                            $month: "$createdAt"
                        }
                    },

                    totalSales: {
                        $sum: "$total"
                    },

                    totalOrders: {
                        $sum: 1
                    }

                }

            },

            {
                $sort: {
                    "_id.month": 1
                }
            }

        ])

        res.status(200).json(monthlySales)

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        })

    }

}

export async function getLowStockProducts(req, res) {

    try {

        const products = await Product.find({

            stock: {
                $lte: 5
            }

        })
            .sort({ stock: 1 })
            .limit(10);

        res.status(200).json(products);

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

}

export async function getLatestUsers(req, res) {

    try {

        const users = await User.find()

            .select("-password")

            .sort({

                createdAt: -1

            })

            .limit(5);

        res.status(200).json(users);

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

}

export async function getLatestReviews(req, res) {

    try {

        const reviews = await Review.find()

            .populate("product")

            .populate("user", "firstName lastName")

            .sort({

                createdAt: -1

            })

            .limit(5);

        res.status(200).json(reviews);

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

}