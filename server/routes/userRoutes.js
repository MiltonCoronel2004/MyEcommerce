import express from "express";
import * as userController from "../controllers/userController.js";
import { authMiddleware, admin } from "../middlewares/authMiddleware.js";

import { registerValidator, loginValidator, passwordUpdateValidator } from "../middlewares/validators/userValidator.js";

import { forgotPasswordValidator, resetPasswordValidator } from "../middlewares/validators/passwordResetValidator.js";

const userRoutes = express.Router();

userRoutes.post("/register", registerValidator, userController.register);

userRoutes.post("/login", loginValidator, userController.login);

userRoutes.post("/forgotpassword", forgotPasswordValidator, userController.forgotPassword);

userRoutes.put("/resetpassword/:token", resetPasswordValidator, userController.resetPassword);

userRoutes.get("/verify/:token", userController.verifyToken);

userRoutes.get("/profile", authMiddleware, userController.getProfile);

userRoutes.put("/profile", authMiddleware, userController.updateProfile);

userRoutes.put("/profile/password", authMiddleware, passwordUpdateValidator, userController.updatePassword);

userRoutes.get("/", authMiddleware, admin, userController.getAll);

userRoutes.put("/:id/role", authMiddleware, admin, userController.updateRoleAdmin);

userRoutes.delete("/:id", authMiddleware, admin, userController.deleteUserAdmin);

export default userRoutes;
