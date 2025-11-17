import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Op } from "sequelize";
import User from "../models/User.js";
import sendEmail from "../utils/email.js";
import { log } from "console";

const JWT_SECRET = process.env.JWT_SECRET;

// Función de ayuda para generar el token de reseteo
const getResetPasswordToken = () => {
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutos
  return { resetToken, resetPasswordToken, resetPasswordExpire };
};

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: "Ya existe un usuario con este correo electrónico." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
    });

    const userJson = user.toJSON();
    delete userJson.passwordHash;

    res.status(201).json({ msg: "Usuario registrado con éxito", user: userJson });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: true, msg: "Credenciales inválidas" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: true, msg: "Credenciales inválidas" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const cleanUser = {
      id: user.id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      addressLine1: user.addressLine1,
      addressLine2: user.addressLine2,
      city: user.city,
      state: user.state,
      postalCode: user.postalCode,
      country: user.country,
    };

    res.json({ token, user: cleanUser });
  } catch (error) {
    res.status(401).json({ msg: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["passwordHash"] },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Error al recuperar usuarios" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.authInfo.id, {
      attributes: { exclude: ["passwordHash"] },
    });
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado." });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ error: true, msg: "No se proporcionó ningún token." });
    jwt.verify(token, JWT_SECRET);
    res.json({ error: false, msg: "Token Válido" });
  } catch (error) {
    res.status(401).json({ error: true, msg: "Token inválido.", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const id = req.authInfo.id;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado." });

    const updatedFields = {
      firstName: req.body.firstName ?? user.firstName,
      lastName: req.body.lastName ?? user.lastName,
      email: req.body.email ?? user.email,
      phone: req.body.phone === "" ? null : req.body.phone,
      addressLine1: req.body.addressLine1 === "" ? null : req.body.addressLine1,
      addressLine2: req.body.addressLine2 === "" ? null : req.body.addressLine2,
      city: req.body.city === "" ? null : req.body.city,
      state: req.body.state === "" ? null : req.body.state,
      postalCode: req.body.postalCode === "" ? null : req.body.postalCode,
      country: req.body.country === "" ? null : req.body.country,
    };

    await User.update(updatedFields, { where: { id } });

    const newUser = await User.findByPk(id, {
      attributes: { exclude: ["passwordHash"] },
    });

    res.json(newUser);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ msg: "Se requieren la contraseña anterior y la nueva." });
    }

    const user = await User.findByPk(req.authInfo.id);
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ msg: "La contraseña anterior es incorrecta." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "Contraseña actualizada con éxito." });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// --- Admin Controllers ---

export const updateRoleAdmin = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ msg: "El rol es obligatorio." });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado." });
    }

    user.role = role;
    await user.save();

    const userJson = user.toJSON();
    delete userJson.passwordHash;
    res.json(userJson);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const deleteUserAdmin = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado." });
    }

    await user.destroy();
    res.json({ msg: "Usuario eliminado con éxito." });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// --- Password Reset ---

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(404).json({ msg: "No hay ningún usuario con ese correo electrónico" });
    }

    const { resetToken, resetPasswordToken, resetPasswordExpire } = getResetPasswordToken();

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    const resetUrl = `${req.protocol}://${req.get("host")}/api/users/resetpassword/${resetToken}`;
    const message = `Estás recibiendo este correo porque tú (u otra persona) ha solicitado restablecer la contraseña. Por favor, haz una petición PUT a: \n\n ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Token de Restablecimiento de Contraseña",
      message,
    });

    res.status(200).json({ success: true, data: "Correo electrónico enviado" });
  } catch (error) {
    // En producción, puede que no quieras revelar si un usuario existe o no.
    // Por ahora, enviamos un error más específico.
    res.status(400).json({ msg: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ msg: "Token inválido" });
    }

    user.passwordHash = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.json({ msg: "Contraseña restablecida con éxito." });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
