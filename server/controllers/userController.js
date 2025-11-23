import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Op } from "sequelize";
import User from "../models/User.js";
import { Resend } from "resend";

const JWT_SECRET = process.env.JWT_SECRET;
const resend = new Resend(process.env.RESEND_API_KEY);

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

    res.status(201).json({ msg: "Usuario registrado con éxito", user });
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
    res.status(500).json({ msg: "Error al recuperar usuarios", details: error.message });
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
    res.status(401).json({ error: true, msg: "Token inválido.", details: error.message });
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

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(404).json({ msg: "No hay ningún usuario con ese correo electrónico" });

    const { resetToken, resetPasswordToken, resetPasswordExpire } = getResetPasswordToken();

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer Contraseña</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Restablecer Contraseña</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                                Estás recibiendo este correo porque tú (u otra persona) ha solicitado restablecer la contraseña de tu cuenta.
                            </p>

                            <p style="margin: 0 0 30px 0; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                                Por favor, haz clic en el siguiente botón para completar el proceso:
                            </p>

                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 0 0 30px 0;">
                                        <a href=${resetUrl} style="display: inline-block; padding: 16px 40px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">
                                            Restablecer Contraseña
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                                O copia y pega este enlace en tu navegador:
                            </p>

                            <p style="margin: 0 0 30px 0; padding: 16px; background-color: #334155; border-radius: 6px; color: #10b981; font-size: 14px; word-break: break-all;">
                                ${resetUrl}
                            </p>

                            <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                                <strong>Si no has solicitado este cambio</strong>, ignora este correo y tu contraseña permanecerá sin cambios.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #0f172a; border-top: 1px solid #334155;">
                            <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.6; text-align: center;">
                                Este enlace expirará en 1 hora por razones de seguridad.
                            </p>
                            <p style="margin: 10px 0 0 0; color: #64748b; font-size: 12px; line-height: 1.6; text-align: center;">
                                © 2025 Tu Empresa. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [req.body.email],
      subject: "Restablecer Contraseña - MyEcommerce",
      html: message,
    });

    if (error) return console.error(error);
    console.log(data);
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
