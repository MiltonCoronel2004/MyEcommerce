import { body, validationResult } from "express-validator";

const validationResultHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const forgotPasswordValidator = [
    body("email").isEmail().withMessage("Por favor, proporciona un correo electrónico válido."),
    validationResultHandler,
];

export const resetPasswordValidator = [
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres."),
    validationResultHandler,
];
