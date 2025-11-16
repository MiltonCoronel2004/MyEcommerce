import express from "express";
import * as cartController from "../controllers/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";

import {
  cartItemValidator,
  cartUpdateValidator,
} from "../middlewares/validators/cartValidator.js";

const router = express.Router();

// All routes in this file are protected
router.use(protect);

// @desc    Get user's cart
// @route   GET /api/cart
router.get("/", cartController.get);

// @desc    Add product to cart
// @route   POST /api/cart/add
router.post("/add", cartItemValidator, cartController.add);

// @desc    Update product quantity in cart
// @route   PUT /api/cart/update/:productId
router.put("/update/:productId", cartUpdateValidator, cartController.update);

// @desc    Remove product from cart
// @route   DELETE /api/cart/remove/:productId
router.delete("/remove/:productId", cartController.remove);

// @desc    Clear user's cart
// @route   DELETE /api/cart/clear
router.delete("/clear", cartController.clear);

export default router;
