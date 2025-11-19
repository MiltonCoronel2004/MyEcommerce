import express from "express";
import * as cartController from "../controllers/cartController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { cartItemValidator, cartUpdateValidator } from "../middlewares/validators/cartValidator.js";
import { validationResultHandler } from "../middlewares/errorMiddleware.js";

const cartRoutes = express.Router();

cartRoutes.use(authMiddleware);
cartRoutes.get("/", cartController.get);
cartRoutes.post("/add", cartItemValidator, validationResultHandler, cartController.add);
cartRoutes.put("/update/:productId", cartUpdateValidator, validationResultHandler, cartController.update);
cartRoutes.delete("/remove/:productId", cartController.remove);
cartRoutes.delete("/clear", cartController.clear);

export default cartRoutes;
