import { body, validationResult } from "express-validator";

const validationResultHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const cartItemValidator = [
  body("productId").notEmpty().withMessage("El ID del producto es obligatorio."),
  body("quantity")
    .isInt({ gt: 0 })
    .withMessage("La cantidad debe ser un número entero positivo."),
  validationResultHandler,
];

export const cartUpdateValidator = [
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("La cantidad debe ser un número entero no negativo."),
    validationResultHandler,
  ];
