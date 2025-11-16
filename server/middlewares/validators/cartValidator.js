import { body, validationResult } from "express-validator";

const validationResultHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const cartItemValidator = [
  body("productId").notEmpty().withMessage("Product ID is required."),
  body("quantity")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be a positive integer."),
  validationResultHandler,
];

export const cartUpdateValidator = [
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer."),
    validationResultHandler,
  ];
