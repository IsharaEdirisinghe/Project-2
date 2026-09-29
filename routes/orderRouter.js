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

const orderRouter = express.Router();

orderRouter.post(
    "/",
    validateAddress,
    validatePaymentMethod,
    createOrder
);

orderRouter.get("/", getOrders);

orderRouter.get("/my-orders", getOrderHistory);

orderRouter.put("/:orderId", updateOrderStatus);

orderRouter.get("/confirm/:orderId", confirmOrder);

export default orderRouter;