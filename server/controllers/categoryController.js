import Category from "../models/Category.js";
import Product from "../models/Product.js";

export const getAll = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar las categorías" });
  }
};

export const getById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    const updatedCategory = await category.update(req.body);
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    const products = await Product.count({ where: { categoryId: req.params.id } });
    if (products > 0) {
      return res.status(400).json({ message: "No se puede eliminar la categoría con productos asociados." });
    }

    await category.destroy();
    res.json({ message: "Categoría eliminada con éxito" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};