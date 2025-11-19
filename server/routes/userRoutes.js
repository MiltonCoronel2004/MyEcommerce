import express from "express";
import * as userController from "../controllers/userController.js";
import { authMiddleware, admin } from "../middlewares/authMiddleware.js";

import { registerValidator, loginValidator, passwordUpdateValidator } from "../middlewares/validators/userValidator.js";

import { forgotPasswordValidator, resetPasswordValidator } from "../middlewares/validators/passwordResetValidator.js";
import { validationResultHandler } from "../middlewares/errorMiddleware.js";

const userRoutes = express.Router();

userRoutes.post("/register", registerValidator, validationResultHandler, userController.register);

userRoutes.post("/login", loginValidator, validationResultHandler, userController.login);

userRoutes.post("/forgotpassword", forgotPasswordValidator, validationResultHandler, userController.forgotPassword);

userRoutes.put("/resetpassword/:token", resetPasswordValidator, validationResultHandler, userController.resetPassword);

userRoutes.get("/verify/:token", userController.verifyToken);

userRoutes.get("/profile", authMiddleware, userController.getProfile);

userRoutes.put("/profile", authMiddleware, userController.updateProfile);

userRoutes.put("/profile/password", authMiddleware, passwordUpdateValidator, userController.updatePassword);

userRoutes.get("/", authMiddleware, admin, userController.getAll);

userRoutes.put("/:id/role", authMiddleware, admin, userController.updateRoleAdmin);

userRoutes.delete("/:id", authMiddleware, admin, userController.deleteUserAdmin);

export default userRoutes;
