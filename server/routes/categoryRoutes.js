import express from "express";
import { authMiddleware, admin } from "../middlewares/authMiddleware.js";
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../controllers/categoryController.js";
import { categoryValidator } from "../middlewares/validators/categoryValidator.js";
import { validationResultHandler } from "../middlewares/errorMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, admin, categoryValidator, validationResultHandler, createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id", authMiddleware, admin, categoryValidator, validationResultHandler, updateCategory);
router.delete("/:id", authMiddleware, admin, deleteCategory);

export default router;
