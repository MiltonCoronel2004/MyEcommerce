import { body, validationResult } from "express-validator";
import Category from "../../models/Category.js";

export const categoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre de la categoría es obligatorio.")
    .custom(async (name, { req }) => {
      const category = await Category.findOne({ where: { name } });
      if (category) {
        if (req.params.id && category.id === parseInt(req.params.id, 10)) {
          return true;
        }
        throw new Error("La categoría ya existe");
      }
      return true;
    }),
  body("description").optional().trim().isString().withMessage("La descripción debe ser texto."),
];
