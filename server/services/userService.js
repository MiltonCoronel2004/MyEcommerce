import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { Sequelize } from "sequelize";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to generate reset token
const getResetPasswordToken = () => {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
  
    // Hash token and set to resetPasswordToken field
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    // Set expire
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
    return { resetToken, resetPasswordToken, resetPasswordExpire };
};

export const registerUser = async (userData) => {
  const { firstName, lastName, email, password } = userData;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstName,
    lastName,
    email,
    passwordHash,
  });

  // Return user data without the password hash
  const userJson = user.toJSON();
  delete userJson.passwordHash;
  return userJson;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Invalid credentials.");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid credentials.");
  }

  const payload = {
    user: {
      id: user.id,
      role: user.role,
    },
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  // Return user data without the password hash
  const userJson = user.toJSON();
  delete userJson.passwordHash;

  return { token, user: userJson };
};

export const getAllUsers = async () => {
  const users = await User.findAll({
    attributes: { exclude: ["passwordHash"] },
  });
  return users;
};

export const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["passwordHash"] },
  });
  if (!user) {
    throw new Error("User not found.");
  }
  return user;
};

export const updateUserProfile = async (userId, profileData) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  // Whitelist fields that can be updated
  const { firstName, lastName, phone, addressLine1, addressLine2, city, state, postalCode, country } = profileData;
  
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.phone = phone || user.phone;
  user.addressLine1 = addressLine1 || user.addressLine1;
  user.addressLine2 = addressLine2 || user.addressLine2;
  user.city = city || user.city;
  user.state = state || user.state;
  user.postalCode = postalCode || user.postalCode;
  user.country = country || user.country;

  await user.save();

  const userJson = user.toJSON();
  delete userJson.passwordHash;
  return userJson;
};

export const updateUserPassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found.");
    }
  
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error("Incorrect old password.");
    }
  
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
  
    return { message: "Password updated successfully." };
};

// --- Admin Functions ---

export const updateUserRoleAdmin = async (userId, role) => {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    user.role = role;
    await user.save();

    const userJson = user.toJSON();
    delete userJson.passwordHash;
    return userJson;
};

export const deleteUserAdmin = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    await user.destroy();
    return { message: "User deleted successfully." };
};

export const forgotPassword = async (email) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error("There is no user with that email");
    }

    // Get reset token
    const { resetToken, resetPasswordToken, resetPasswordExpire } = getResetPasswordToken();

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;

    await user.save();

    return resetToken;
};

export const resetPassword = async (token, newPassword) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        where: {
            resetPasswordToken,
            resetPasswordExpire: { [sequelize.Op.gt]: Date.now() },
        },
    });

    if (!user) {
        throw new Error("Invalid token");
    }

    // Set new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    return { message: "Password reset successfully." };
};
