import express from "express";
import {
    createUser,
    createAdminUser,
    loginUser,
    loginWithGoogle,
    changePassword,
    resetPassword,
    sendOTP,
    getProfile,
    updateProfile,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearInvalidCartItems
} from "../controllers/userController.js";
import verifyToken from "../middlewares/verifyToken.js";
import isAdmin from "../middlewares/isAdmin.js";


const userRouter = express.Router();

userRouter.post("/", createUser)
userRouter.post(
    "/admin",
    verifyToken,
    isAdmin,
    createAdminUser
)
userRouter.post("/login", loginUser)
userRouter.post("/login/google", loginWithGoogle)
userRouter.post("/send-otp", sendOTP)
userRouter.put(
    "/change-password",
    verifyToken,
    changePassword
);
userRouter.post(
    "/reset-password",
    resetPassword
);
userRouter.get("/profile", verifyToken, getProfile)
userRouter.put("/profile", verifyToken, updateProfile)
userRouter.get("/wishlist", verifyToken, getWishlist);
userRouter.post("/wishlist/:productId", verifyToken, addToWishlist);
userRouter.delete("/wishlist/:productId", verifyToken, removeFromWishlist);
userRouter.get("/addresses", verifyToken, getAddresses);
userRouter.post("/addresses", verifyToken, addAddress);
userRouter.put("/addresses/:id", verifyToken, updateAddress);
userRouter.delete("/addresses/:id", verifyToken, deleteAddress);
userRouter.get("/cart", verifyToken, getCart);
userRouter.delete("/cart/invalid/clear",verifyToken,clearInvalidCartItems);
userRouter.post("/cart/:productId", verifyToken, addToCart);
userRouter.put("/cart/:productId", verifyToken, updateCartQuantity);
userRouter.delete("/cart/:productId", verifyToken, removeFromCart);



export default userRouter;