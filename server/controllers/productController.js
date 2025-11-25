import Product from "../models/Product.js";
import Category from "../models/Category.js";
import PDFDocument from "pdfkit";
import { streamToBuffer, drawTable, drawHeader, drawFooter } from "../utils/pdfGenerator.js";

/**
 * Obtiene todos los productos, con la opción de filtrar por categoría.
 */
export const getAll = async (req, res) => {
  try {
    const { category } = req.query;
    const options = {
      include: [{ model: Category, attributes: ["name"] }],
      where: {},
    };

    if (category) options.where["$Category.name$"] = category;

    const products = await Product.findAll(options);
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const getById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, attributes: ["name"] }],
    });

    if (!product) return res.status(404).json({ error: true, msg: "Producto no encontrado" });

    res.json(product);
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const create = async (req, res) => {
  try {
    const productData = { ...req.body };
    if (req.file) productData.imageUrl = `${req.file.filename}`;

    const newProduct = await Product.create(productData);
    res.status(201).json(newProduct);
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) return res.status(404).json({ error: true, msg: "Producto no encontrado" });

    const updateData = { ...req.body };
    if (req.file) updateData.imageUrl = req.file.filename;

    const updatedProduct = await product.update(updateData);
    res.json(updatedProduct);
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const remove = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) return res.status(404).json({ error: true, msg: "Producto no encontrado" });

    await product.destroy();
    res.json({ error: false, message: "Producto eliminado con éxito" });
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const exportInventory = async (req, res) => {
  const timestamp = new Date().toISOString().replace(/:/g, "-");

  try {
    const products = await Product.findAll({
      include: [{ model: Category, attributes: ["name"] }],
      order: [["name", "ASC"]],
    });

    const reportData = products.map((product) => ({
      ID: product.id,
      Nombre: product.name,
      Descripción: product.description,
      Categoría: product.Category.name,
      Precio: product.price,
      Stock: product.stock,
    }));

    const doc = new PDFDocument({ layout: "landscape" });
    drawHeader(doc, "Reporte de Inventario", "Lista detallada de todos los productos en inventario");

    const table = {
      headers: ["ID", "Nombre", "Descripción", "Categoría", "Precio", "Stock"],
      rows: reportData.map((product) => [product.ID, product.Nombre, product.Descripción, product.Categoría, `$${product.Precio}`, product.Stock]),
    };

    drawTable(doc, table);
    drawFooter(doc);

    doc.end();
    const buffer = await streamToBuffer(doc);
    const fileData = buffer.toString("base64");
    res.json({
      filename: `inventory-report-${timestamp}.pdf`,
      fileData,
    });
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};
