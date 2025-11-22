import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createCheckoutSession,
  verifyPaymentSession,
} from "../controllers/paymentController.js";

const paymentRoutes = express.Router();

paymentRoutes.post(
  "/create-checkout-session",
  authMiddleware,
  createCheckoutSession
);
paymentRoutes.post(
  "/verify-session",
  authMiddleware,
  verifyPaymentSession
);

export default paymentRoutes;
