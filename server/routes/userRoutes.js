import express from "express";
import * as userController from "../controllers/userController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

import {
  registerValidator,
  loginValidator,
  passwordUpdateValidator,
} from "../middlewares/validators/userValidator.js";

import {
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../middlewares/validators/passwordResetValidator.js";

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
router.post("/register", registerValidator, userController.register);

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post("/login", loginValidator, userController.login);

// @desc    Forgot password
// @route   POST /api/users/forgotpassword
// @access  Public
router.post("/forgotpassword", forgotPasswordValidator, userController.forgotPassword);

// @desc    Reset password
// @route   PUT /api/users/resetpassword/:token
// @access  Public
router.put("/resetpassword/:token", resetPasswordValidator, userController.resetPassword);

// @desc    Verify user token and get fresh user data
// @route   GET /api/users/verify
// @access  Private
router.get("/verify", protect, userController.verifyUser);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get("/profile", protect, userController.getProfile);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put("/profile", protect, userController.updateProfile);

// @desc    Update user password
// @route   PUT /api/users/profile/password
// @access  Private
router.put(
  "/profile/password",
  protect,
  passwordUpdateValidator,
  userController.updatePassword
);

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get("/", protect, admin, userController.getAll);

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
router.put("/:id/role", protect, admin, userController.updateRoleAdmin);

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete("/:id", protect, admin, userController.deleteUserAdmin);

export default router;
