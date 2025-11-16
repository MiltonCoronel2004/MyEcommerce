import express from "express";
import * as categoryController from "../controllers/categoryController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

import { categoryValidator } from "../middlewares/validators/categoryValidator.js";

const router = express.Router();

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
router.get("/", categoryController.getAll);

// @desc    Fetch single category
// @route   GET /api/categories/:id
// @access  Public
router.get("/:id", categoryController.getById);

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
router.post("/", protect, admin, categoryValidator, categoryController.create);

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put("/:id", protect, admin, categoryValidator, categoryController.update);

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete("/:id", protect, admin, categoryController.remove);

export default router;
