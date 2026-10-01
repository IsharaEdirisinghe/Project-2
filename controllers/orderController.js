import { json } from "express"
import Order from "../models/order.js"
import Product from "../models/product.js"
import User from "../models/user.js";

const DELIVERY_FEE = 300;

export async function createOrder(req, res) {

    if (req.user == null) {
        return res.status(403).json({
            message: "Please login and try again"
        });
    }

    try {

        const orderInfo = req.body;

        // Check address
        if (!orderInfo.address || !orderInfo.address.trim()) {
            return res.status(400).json({
                message: "Address is required"
            });
        }

        // Check phone
        if (!orderInfo.phone || !orderInfo.phone.trim()) {
            return res.status(400).json({
                message: "Phone number is required"
            });
        }

        // Check products
        if (
            !orderInfo.products ||
            !Array.isArray(orderInfo.products) ||
            orderInfo.products.length === 0
        ) {
            return res.status(400).json({
                message: "No products in order"
            });
        }

        // Check payment method
        if (!orderInfo.paymentMethod) {
            return res.status(400).json({
                message: "Payment method is required"
            });
        }

        // Customer name
        if (!orderInfo.name) {
            orderInfo.name =
                req.user.firstName + " " + req.user.lastName;
        }

        // Generate order ID
        let orderId = "CBC00001";

        const lastOrder = await Order
            .find()
            .sort({ date: -1 })
            .limit(1);

        if (lastOrder.length > 0) {

            const lastOrderId = lastOrder[0].orderId;

            const lastOrderNumberString =
                lastOrderId.replace("CBC", "");

            const lastOrderNumber =
                parseInt(lastOrderNumberString);

            const newOrderNumber =
                lastOrderNumber + 1;

            const newOrderNumberString =
                String(newOrderNumber).padStart(5, "0");

            orderId = "CBC" + newOrderNumberString;
        }

        let total = 0;
        let labelledTotal = 0;

        const products = [];

        // Process each product
        for (let i = 0; i < orderInfo.products.length; i++) {

            const orderProduct = orderInfo.products[i];

            // Basic validation
            if (
                !orderProduct.productId ||
                !orderProduct.qty ||
                !orderProduct.size ||
                !orderProduct.color
            ) {
                return res.status(400).json({
                    message:
                        "Product ID, quantity, size and color are required"
                });
            }

            const quantity = Number(orderProduct.qty);

            if (quantity < 1) {
                return res.status(400).json({
                    message: "Quantity must be at least 1"
                });
            }

            // Find product
            const product = await Product.findOne({
                productId: orderProduct.productId
            });

            if (!product) {
                return res.status(404).json({
                    message:
                        "Product with productId " +
                        orderProduct.productId +
                        " not found"
                });
            }

            // Find selected variant
            const variant = product.variants.find(
                (v) =>
                    v.size === orderProduct.size &&
                    v.color === orderProduct.color
            );

            if (!variant) {
                return res.status(400).json({
                    message:
                        product.name +
                        " - selected size and color are not available"
                });
            }

            // Check variant stock
            if (variant.stock < quantity) {
                return res.status(400).json({
                    message:
                        product.name +
                        " (" +
                        orderProduct.size +
                        ", " +
                        orderProduct.color +
                        ") does not have enough stock"
                });
            }

            // Save product snapshot inside order
            products.push({
                productInfo: {
                    productId: product.productId,
                    name: product.name,
                    altNames: product.altNames,
                    description: product.description,
                    images: product.images,
                    labelledPrice: product.labelledPrice,
                    price: product.price,
                    size: orderProduct.size,
                    color: orderProduct.color
                },
                quantity: quantity
            });

            // Calculate totals
            total += product.price * quantity;

            labelledTotal +=
                product.labelledPrice * quantity;
        }

        const subtotal = total;
        const finalTotal = subtotal + DELIVERY_FEE;

        // Create order
        const order = new Order({
            orderId: orderId,
            email: req.user.email,
            name: orderInfo.name,
            address: orderInfo.address,
            phone: orderInfo.phone,
            paymentMethod: orderInfo.paymentMethod,
            products: products,
            labelledTotal: labelledTotal,
            deliveryFee: DELIVERY_FEE,
            total: finalTotal
        });

        const createdOrder = await order.save();

        await User.findOneAndUpdate(
            {
                email: req.user.email
            },
            {
                $set: {
                    cart: []
                }
            }
        );

        // Reduce variant stock
        // Reduce variant stock
        // Reduce variant stock safely
        for (let i = 0; i < orderInfo.products.length; i++) {

            const orderProduct = orderInfo.products[i];

            const quantity = Number(orderProduct.qty);

            const result = await Product.updateOne(
                {
                    productId: orderProduct.productId,
                    variants: {
                        $elemMatch: {
                            size: orderProduct.size,
                            color: orderProduct.color,
                            stock: { $gte: quantity }
                        }
                    }
                },
                {
                    $inc: {
                        "variants.$[variant].stock": -quantity
                    }
                },
                {
                    arrayFilters: [
                        {
                            "variant.size": orderProduct.size,
                            "variant.color": orderProduct.color
                        }
                    ]
                }
            );

            if (result.modifiedCount === 0) {

                return res.status(400).json({
                    message:
                        "Stock is no longer available for " +
                        orderProduct.productId +
                        " (" +
                        orderProduct.size +
                        ", " +
                        orderProduct.color +
                        ")"
                });
            }
        }

        res.status(201).json({
            message: "Order created successfully",
            order: createdOrder
        });

    } catch (err) {

        console.error("Create order error:", err);

        res.status(500).json({
            message: "Failed to create order",
            error: err.message
        });
    }
}

export async function getOrders(req, res) {
    try {
        const orders = await Order.find().sort({ date: -1 });

        res.json(orders);

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Failed to fetch orders",
            error: err.message
        });
    }
}

export async function updateOrderStatus(req, res) {

    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const validStatuses = [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!validStatuses.includes(status)) {

            return res.status(400).json({
                message: "Invalid order status"
            });

        }

        const order = await Order.findOne({ orderId });

        if (!order) {

            return res.status(404).json({
                message: "Order not found"
            });

        }

        // Update status
        order.status = status;

        // Count sold products only when order becomes delivered
        if (
            status === "delivered" &&
            order.salesCounted === false
        ) {

            for (let i = 0; i < order.products.length; i++) {

                const orderProduct = order.products[i];

                await Product.findOneAndUpdate(
                    {
                        productId:
                            orderProduct.productInfo.productId
                    },
                    {
                        $inc: {
                            totalSold:
                                orderProduct.quantity
                        }
                    }
                );
            }

            order.salesCounted = true;
        }

        await order.save();

        res.json({

            message: "Order status updated",

            order

        });

    }

    catch (err) {

        console.error(
            "Update order status error:",
            err
        );

        res.status(500).json({

            message: err.message

        });

    }

}

export async function getOrderHistory(req, res) {
    try {
        const orders = await Order.find({
            email: req.user.email
        }).sort({
            date: -1
        });

        res.json(orders);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}



export async function confirmOrder(req, res) {

    try {

        const { orderId } = req.params;

        const order = await Order.findOne({
            orderId,
            email: req.user.email
        });

        if (!order) {

            return res.status(404).json({

                message: "Order not found"

            });

        }

        res.status(200).json({

            success: true,

            message: "Order confirmed successfully",

            orderId: order.orderId,

            customer: order.name,

            total: order.total,

            status: order.status,

            date: order.date

        });

    }

    catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

}