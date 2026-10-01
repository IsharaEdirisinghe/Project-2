import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import isAdmin from "../middlewares/isAdmin.js";
import { getDashboardStats, getTopSellingProducts, getMonthlySales, getLowStockProducts, getLatestUsers, getLatestReviews } from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();

dashboardRouter.get(
    "/stats",
    verifyToken,
    isAdmin,
    getDashboardStats
);

dashboardRouter.get(
    "/top-products",
    verifyToken,
    isAdmin,
    getTopSellingProducts
);

dashboardRouter.get(
    "/monthly-sales",
    verifyToken,
    isAdmin,
    getMonthlySales
);

dashboardRouter.get(
    "/low-stock",
    verifyToken,
    isAdmin,
    getLowStockProducts
);

dashboardRouter.get(
    "/latest-users",
    verifyToken,
    isAdmin,
    getLatestUsers
);

dashboardRouter.get(
    "/latest-reviews",
    verifyToken,
    isAdmin,
    getLatestReviews
);

export default dashboardRouter;