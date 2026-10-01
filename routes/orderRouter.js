import express from "express";

import {
    createOrder,
    getOrders,
    updateOrderStatus,
    getOrderHistory,
    confirmOrder
} from "../controllers/orderController.js";

import validateAddress from "../middlewares/validateAddress.js";
import validatePaymentMethod from "../middlewares/validatePaymentMethod.js";
import verifyToken from "../middlewares/verifyToken.js";
import isAdmin from "../middlewares/isAdmin.js";

const orderRouter = express.Router();


// Customer - Create Order
orderRouter.post(
    "/",
    verifyToken,
    validateAddress,
    validatePaymentMethod,
    createOrder
);


// Admin - Get All Orders
orderRouter.get(
    "/",
    verifyToken,
    isAdmin,
    getOrders
);


// Customer - Get Own Orders
orderRouter.get(
    "/my-orders",
    verifyToken,
    getOrderHistory
);


// Admin - Update Order Status
orderRouter.put(
    "/:orderId",
    verifyToken,
    isAdmin,
    updateOrderStatus
);


// Customer - Confirm Own Order
orderRouter.get(
    "/confirm/:orderId",
    verifyToken,
    confirmOrder
);

export default orderRouter;