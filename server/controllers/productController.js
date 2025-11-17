import Product from "../models/Product.js";
import Category from "../models/Category.js";

export const getAll = async (req, res) => {
  try {
    const { category } = req.query;
    const options = {
      include: [{ model: Category, attributes: ["name"] }],
      where: {},
    };

    if (category) {
      options.where['$Category.name$'] = category;
    }

    const products = await Product.findAll(options);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar los productos" });
  }
};

export const getById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, attributes: ["name"] }],
    });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const productData = { ...req.body };
    if (req.file) {
      productData.imageUrl = `/uploads/${req.file.filename}`;
    }
    const newProduct = await Product.create(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message, errors: error.errors });
  }
};

export const update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const updateData = { ...req.body };
    if (req.file) {
        updateData.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const updatedProduct = await product.update(updateData);
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    await product.destroy();
    res.json({ message: "Producto eliminado con éxito" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};