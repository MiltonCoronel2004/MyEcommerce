import { body, validationResult } from "express-validator";



export const cartItemValidator = [
  body("productId").notEmpty().withMessage("El ID del producto es obligatorio."),
  body("quantity")
    .isInt({ gt: 0 })
    .withMessage("La cantidad debe ser un número entero positivo."),
];

export const cartUpdateValidator = [
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("La cantidad debe ser un número entero no negativo."),
  ];
