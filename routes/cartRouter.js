import express from "express";
import {addToCart,removeCartItem,increaseQuantity,decreaseQuantity,getCart,getCartSummary} from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.post("/",addToCart);
cartRouter.delete("/:productId",removeCartItem);
cartRouter.put("/increase/:productId",increaseQuantity);
cartRouter.put("/decrease/:productId",decreaseQuantity);
cartRouter.get("/",getCart);
cartRouter.get("/summary",getCartSummary);

export default cartRouter;