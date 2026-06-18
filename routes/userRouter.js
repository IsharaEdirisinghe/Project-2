import express from "express";
import { createUser, loginUser, loginWithGoogle, resetPassword, sendOTP, getUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/",createUser)
userRouter.post("/login",loginUser)
userRouter.post("login/google",loginWithGoogle)
userRouter.post("/send-otp",sendOTP)
userRouter.post("/reset-password",resetPassword)
userRouter.get("/",getUser)
  
export default userRouter;