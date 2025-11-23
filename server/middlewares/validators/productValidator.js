import { body } from "express-validator";

export const createProductValidator = [
  body("name").notEmpty().withMessage("El nombre del producto es obligatorio."),
  body("sku").notEmpty().withMessage("El SKU es obligatorio."),
  body("price").isFloat({ gt: 0 }).withMessage("El precio debe ser un número positivo."),
  body("stock").optional().isInt({ min: 0 }).withMessage("El stock debe ser un número entero no negativo."),
];

export const updateProductValidator = [
  body("name").optional().notEmpty().withMessage("El nombre del producto no puede estar vacío."),
  body("sku").optional().notEmpty().withMessage("El SKU no puede estar vacío."),
  body("price").optional().isFloat({ gt: 0 }).withMessage("El precio debe ser un número positivo."),
  body("stock").optional().isInt({ min: 0 }).withMessage("El stock debe ser un número entero no negativo."),
];
