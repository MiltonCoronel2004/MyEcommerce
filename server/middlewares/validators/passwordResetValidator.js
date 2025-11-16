import { body, validationResult } from "express-validator";

const validationResultHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const forgotPasswordValidator = [
    body("email").isEmail().withMessage("Please provide a valid email."),
    validationResultHandler,
];

export const resetPasswordValidator = [
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long."),
    validationResultHandler,
];
