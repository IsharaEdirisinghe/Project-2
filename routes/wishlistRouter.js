import express from "express"

import {    addWishlist,removeWishlist,getWishlist}    from "../controllers/wishlistController.js"

const router = express.Router()

router.post("/", addWishlist)
router.delete("/:id", removeWishlist)
router.get("/", getWishlist)

export default router