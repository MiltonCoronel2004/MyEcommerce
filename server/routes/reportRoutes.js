import express from "express";
import * as reportController from "../controllers/reportController.js";
import { authMiddleware, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All report routes should be admin-only
router.use(authMiddleware, admin);

router.get("/orders", reportController.exportOrders);
router.get("/dashboard", reportController.exportDashboard);

export default router;
