import express from "express";
import * as productController from "../controllers/productController.js";
import { authMiddleware, admin } from "../middlewares/authMiddleware.js";

import upload from "../middlewares/uploadMiddleware.js";
import { createProductValidator, updateProductValidator } from "../middlewares/validators/productValidator.js";
import { validationResultHandler } from "../middlewares/errorMiddleware.js";

const router = express.Router();

router.get("/", productController.getAll);

router.get("/:id", productController.getById);

router.post("/", authMiddleware, admin, upload, createProductValidator, validationResultHandler, productController.create);

router.put("/:id", authMiddleware, admin, upload, updateProductValidator, validationResultHandler, productController.update);

router.delete("/:id", authMiddleware, admin, productController.remove);

export default router;
