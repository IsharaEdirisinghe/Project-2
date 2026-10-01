import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import isAdmin from "../middlewares/isAdmin.js";
import {
    deleteProduct,
    getProductById,
    getProducts,
    saveProduct,
    updateProduct,
    searchProducts,
    validateVariant,
    reduceStock,
    getAvailableSizes,
    addRecentlyViewed,
    getRecentlyViewed,
    getRecommendedProducts,
    addReview,
    getProductReviews
} from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/", getProducts); // filter + search + pagination
productRouter.post(
    "/",
    verifyToken,
    isAdmin,
    saveProduct
);
productRouter.get("/recommended", getRecommendedProducts);
productRouter.get("/search/:query", searchProducts);
productRouter.post("/:productId/reviews",verifyToken,addReview);
productRouter.get("/:productId/reviews",getProductReviews);
productRouter.get("/:productId", getProductById);
productRouter.put(
    "/:productId",
    verifyToken,
    isAdmin,
    updateProduct
);
productRouter.delete(
    "/:productId",
    verifyToken,
    isAdmin,
    deleteProduct
);
productRouter.post("/validate", validateVariant);
productRouter.put("/reduce-stock", reduceStock);
productRouter.get("/available-sizes/:productId", getAvailableSizes);
productRouter.post("/recent/:productId", verifyToken, addRecentlyViewed);
productRouter.get("/recent", verifyToken, getRecentlyViewed);

export default productRouter;