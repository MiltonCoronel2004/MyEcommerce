import { validationResult } from "express-validator";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });

    if (!category) return res.status(404).json({ error: true, msg: "Categoría no encontrada" });

    res.json(category);
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const newCategory = await Category.create(req.body);
    res.status(201).json(newCategory);
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) return res.status(404).json({ error: true, msg: "Categoría no encontrada" });

    const updatedCategory = await category.update(req.body);
    res.json(updatedCategory);
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: true, msg: "Categoría no encontrada" });
    
    const products = await Product.count({ where: { categoryId: req.params.id } });
    if (products > 0) return res.status(400).json({ error: true, msg: "No se puede eliminar la categoría con productos asociados." });
    
    await category.destroy();
    res.json({ msg: "Categoría eliminada con éxito" });
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};