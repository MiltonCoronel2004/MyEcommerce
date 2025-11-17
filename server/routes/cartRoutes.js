import express from "express";
import * as cartController from "../controllers/cartController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { cartItemValidator, cartUpdateValidator } from "../middlewares/validators/cartValidator.js";

const cartRoutes = express.Router();

cartRoutes.use(authMiddleware);
cartRoutes.get("/", cartController.get);
cartRoutes.post("/add", cartItemValidator, cartController.add);
cartRoutes.put("/update/:productId", cartUpdateValidator, cartController.update);
cartRoutes.delete("/remove/:productId", cartController.remove);
cartRoutes.delete("/clear", cartController.clear);

export default cartRoutes;
