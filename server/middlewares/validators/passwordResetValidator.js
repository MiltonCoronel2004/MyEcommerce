import { body } from "express-validator";



export const forgotPasswordValidator = [
    body("email").isEmail().withMessage("Por favor, proporciona un correo electrónico válido."),
];

export const resetPasswordValidator = [
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres."),
];
