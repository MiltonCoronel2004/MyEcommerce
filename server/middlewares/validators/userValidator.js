import { body } from "express-validator";

export const registerValidator = [
  body("firstName").notEmpty().withMessage("El nombre es obligatorio."),
  body("lastName").notEmpty().withMessage("El apellido es obligatorio."),
  body("email").isEmail().withMessage("Por favor, proporciona un correo electrónico válido."),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres."),
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

export const profileValidator = [
  body("firstName").notEmpty().withMessage("El nombre es obligatorio."),
  body("lastName").notEmpty().withMessage("El apellido es obligatorio."),
  body("email").isEmail().withMessage("Por favor, proporciona un correo electrónico válido."),
  body("addressLine1").notEmpty().withMessage("La dirección 1 es obligatoria."),
  body("city").notEmpty().withMessage("La ciudad es obligatoria."),
  body("state").notEmpty().withMessage("La provincia es obligatoria."),
  body("postalCode").notEmpty().withMessage("El código postal es obligatorio."),
  body("country").notEmpty().withMessage("El país es obligatorio."),
];
