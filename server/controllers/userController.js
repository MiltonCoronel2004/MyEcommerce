import * as userService from "../services/userService.js";
import sendEmail from "../utils/email.js";

export const register = async (req, res) => {
  try {
    const { repassword, ...userData } = req.body; // Destructure to omit repassword
    const user = await userService.registerUser(userData);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await userService.loginUser(email, password);
    res.json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
};

export const getProfile = async (req, res) => {
  try {
    // The user ID is attached to the request object by the auth middleware
    const user = await userService.getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new passwords are required." });
    }
    const result = await userService.updateUserPassword(req.user.id, oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// --- Admin Controllers ---

export const updateRoleAdmin = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ message: "Role is required." });
    }
    const updatedUser = await userService.updateUserRoleAdmin(req.params.id, role);
    res.json(updatedUser);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deleteUserAdmin = async (req, res) => {
  try {
    const result = await userService.deleteUserAdmin(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// --- Password Reset ---

export const forgotPassword = async (req, res) => {
  try {
    const resetToken = await userService.forgotPassword(req.body.email);

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get("host")}/api/users/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    await sendEmail({
      email: req.body.email,
      subject: "Password Reset Token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const result = await userService.resetPassword(req.params.token, req.body.password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
