import express from "express";
import * as reportController from "../controllers/reportController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// @desc    Download an orders report
// @route   GET /api/reports/orders
// @access  Private/Admin
router.get("/orders", protect, admin, reportController.downloadOrdersReport);

export default router;
