import express from "express";
import * as orderController from "../controllers/orderController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All user-facing routes are protected
router.use(protect);

// --- User Routes ---

// @desc    Create new order
// @route   POST /api/orders
router.post("/", orderController.create);

// @desc    Get logged in user orders
// @route   GET /api/orders
router.get("/", orderController.getForUser);

// @desc    Get order by ID
// @route   GET /api/orders/:id
router.get("/:id", orderController.getByIdForUser);


// --- Admin Routes ---
const adminRouter = express.Router();
adminRouter.use(protect, admin);

// @desc    Get all orders
// @route   GET /api/orders/admin/all
adminRouter.get("/all", orderController.getAllAdmin);

// @desc    Update order status
// @route   PUT /api/orders/admin/:id/status
adminRouter.put("/:id/status", orderController.updateStatusAdmin);

// Mount admin router
router.use('/admin', adminRouter);


export default router;
