import { body, validationResult } from "express-validator";

const validationResultHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const createProductValidator = [
  body("name").notEmpty().withMessage("Product name is required."),
  body("sku").notEmpty().withMessage("SKU is required."),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number."),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer."),
  validationResultHandler,
];

export const updateProductValidator = [
    body("name").optional().notEmpty().withMessage("Product name cannot be empty."),
    body("sku").optional().notEmpty().withMessage("SKU cannot be empty."),
    body("price")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Price must be a positive number."),
    body("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer."),
    validationResultHandler,
  ];
