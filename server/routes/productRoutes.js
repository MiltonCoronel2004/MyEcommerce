import express from "express";
import * as productController from "../controllers/productController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

import upload from "../middlewares/uploadMiddleware.js";
import {
  createProductValidator,
  updateProductValidator,
} from "../middlewares/validators/productValidator.js";

const router = express.Router();

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get("/", productController.getAll);

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get("/:id", productController.getById);

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post(
  "/",
  protect,
  admin,
  upload,
  createProductValidator,
  productController.create
);

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put(
  "/:id",
  protect,
  admin,
  upload,
  updateProductValidator,
  productController.update
);

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete("/:id", protect, admin, productController.remove);

export default router;
