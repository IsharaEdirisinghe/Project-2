import express from "express";

import {addReview, getReviews, updateReview, deleteReview} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/:productId", addReview);
reviewRouter.get("/:productId", getReviews);
reviewRouter.put("/:productId", updateReview);
reviewRouter.delete("/:productId", deleteReview);

export default reviewRouter;