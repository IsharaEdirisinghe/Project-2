import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { getDashboardStats, getTopSellingProducts, getMonthlySales, getLowStockProducts, getLatestUsers, getLatestReviews } from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/stats", verifyToken, getDashboardStats);
dashboardRouter.get("/top-products", verifyToken, getTopSellingProducts);
dashboardRouter.get("/monthly-sales", verifyToken, getMonthlySales);
dashboardRouter.get("/low-stock", verifyToken, getLowStockProducts);
dashboardRouter.get("/latest-users", verifyToken, getLatestUsers);
dashboardRouter.get("/latest-reviews", verifyToken, getLatestReviews

);

export default dashboardRouter;