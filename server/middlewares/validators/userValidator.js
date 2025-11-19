import { body, validationResult } from "express-validator";


export const registerValidator = [
  body("firstName").notEmpty().withMessage("El nombre es obligatorio."),
  body("lastName").notEmpty().withMessage("El apellido es obligatorio."),
  body("email").isEmail().withMessage("Por favor, proporciona un correo electrónico válido."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres."),
  body("repassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Las contraseñas no coinciden.");
      }
      return true;
    })
    .withMessage("Las contraseñas no coinciden."),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Por favor, proporciona un correo electrónico válido."),
  body("password").notEmpty().withMessage("La contraseña es obligatoria."),
];

export const passwordUpdateValidator = [
    body("oldPassword").notEmpty().withMessage("La contraseña anterior es obligatoria."),
    body("newPassword").isLength({ min: 6 }).withMessage("La nueva contraseña debe tener al menos 6 caracteres."),
];
