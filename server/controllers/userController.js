import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Op } from "sequelize";
import User from "../models/User.js";
import { Resend } from "resend";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const JWT_SECRET = process.env.JWT_SECRET;
const resend = new Resend(process.env.RESEND_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Funciones de Reseteo de Contraseña ---


const getResetPasswordToken = () => {
  // Genera un token aleatorio de 20 bytes.
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashea el token para guardarlo en la base de datos. Se usa sha256, un algoritmo de hash estándar y seguro.
  const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Establece una fecha de expiración para el token (10 minutos).
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return { resetToken, resetPasswordToken, resetPasswordExpire };
};

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: true, msg: "Ya existe un usuario con este correo electrónico." });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
    });

    res.status(201).json({ msg: "Usuario registrado con éxito", user });
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
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
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["passwordHash"] },
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.authInfo.id, {
      attributes: { exclude: ["passwordHash"] },
    });
    if (!user) return res.status(404).json({ error: true, msg: "Usuario no encontrado." });

    res.json(user);
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ error: true, msg: "No se proporcionó ningún token" });

    jwt.verify(token, JWT_SECRET);
    res.json({ error: false, msg: "Token Válido" });
  } catch (e) {
    res.status(401).json({ error: true, msg: e.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const id = req.authInfo.id;
    const { email } = req.body;

    if (email) {
      const existingUser = await User.findOne({ where: { email, id: { [Op.ne]: id } } });
      if (existingUser) {
        return res.status(400).json({ error: true, msg: "Ya existe un usuario con este correo electrónico." });
      }
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: true, msg: "Usuario no encontrado." });

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
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: true, msg: "Se requieren la contraseña anterior y la nueva." });

    const user = await User.findByPk(req.authInfo.id);
    if (!user) return res.status(404).json({ error: true, msg: "Usuario no encontrado." });

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: true, msg: "La contraseña anterior es incorrecta." });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "Contraseña actualizada con éxito." });
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

// --- Admin Controllers ---

export const updateRoleAdmin = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: true, msg: "El rol es obligatorio." });

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: true, msg: "Usuario no encontrado." });

    user.role = role;
    await user.save();

    const userJson = user.toJSON();
    delete userJson.passwordHash;
    res.json(userJson);
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const deleteUserAdmin = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: true, msg: "Usuario no encontrado." });

    await user.destroy();
    res.json({ msg: "Usuario eliminado con éxito." });
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      // Se devuelve una respuesta exitosa incluso si el usuario no existe
      // para no revelar qué correos están registrados en el sistema.
      return res.status(200).json({ success: true, data: "Correo electrónico enviado si el usuario existe." });
    }

    // Genera el token y su versión hasheada.
    const { resetToken, resetPasswordToken, resetPasswordExpire } = getResetPasswordToken();

    // Asigna el token hasheado y la fecha de expiración al usuario.
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    // Construye la URL de reseteo que se enviará al usuario.
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Lee la plantilla de correo y reemplaza los placeholders.
    const templatePath = path.join(__dirname, "../templates/passwordReset.html");
    let html = await fs.readFile(templatePath, "utf-8");
    html = html.replace("{{resetUrl}}", resetUrl);
    html = html.replace("{{resetUrl}}", resetUrl);

    // Envía el correo electrónico.
    await resend.emails.send({
      from: "MyEcommerce <onboarding@resend.dev>",
      to: [user.email],
      subject: "Restablecer Contraseña - MyEcommerce",
      html: html,
    });

    res.status(200).json({ success: true, data: "Correo electrónico enviado." });
  } catch (e) {
    // Limpia los campos de reseteo si algo falla para evitar estados inconsistentes.
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
    }
    console.error("Error en forgotPassword:", e);
    res.status(500).json({ error: true, msg: e.message });
  }
};


//  Restablece la contraseña de un usuario utilizando un token válido.

export const resetPassword = async (req, res) => {
  try {
    // Hashea el token recibido en la URL para compararlo con el que está en la base de datos.
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    // Busca al usuario por el token hasheado y verifica que no haya expirado.
    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() }, // [Op.gt] significa "greater than" (mayor que).
      },
    });

    if (!user) return res.status(400).json({ error: true, msg: "El token de reseteo es inválido o ha expirado." });

    // Actualiza la contraseña del usuario con la nueva.
    user.passwordHash = await bcrypt.hash(req.body.password, 10);
    // Limpia los campos del token de reseteo.
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.json({ msg: "Contraseña restablecida con éxito." });
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};
