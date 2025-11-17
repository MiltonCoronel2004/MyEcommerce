import { body, validationResult } from "express-validator";

const validationResultHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const categoryValidator = [
  body("name").notEmpty().withMessage("El nombre de la categoría es obligatorio."),
  validationResultHandler,
];
