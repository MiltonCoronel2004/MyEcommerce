import express from "express";
import * as orderController from "../controllers/orderController.js";
import { authMiddleware, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", orderController.create);

router.get("/", orderController.getForUser);

router.get("/:id", orderController.getByIdForUser);

const adminRouter = express.Router();

adminRouter.use(authMiddleware, admin);

adminRouter.get("/all", orderController.getAllAdmin);

adminRouter.put("/:id/status", orderController.updateStatusAdmin);

router.use("/admin", adminRouter);

export default router;
