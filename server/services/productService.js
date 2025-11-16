import Product from "../models/Product.js";
import Category from "../models/Category.js";

/**
 * Get all products with optional filtering and pagination
 * @param {object} filters - Filtering options (e.g., category)
 * @returns {Promise<Product[]>}
 */
export const getAllProducts = async (filters = {}) => {
  const options = {
    include: [{ model: Category, attributes: ["name"] }],
    where: {},
  };

  if (filters.category) options.where["$Category.name$"] = filters.category;

  // Add more filters like price range, etc. as needed

  const products = await Product.findAll(options);
  return products;
};

/**
 * Get a single product by its ID
 * @param {number} id - The ID of the product
 * @returns {Promise<Product>}
 */
export const getProductById = async (id) => {
  const product = await Product.findByPk(id, {
    include: [{ model: Category, attributes: ["name"] }],
  });

  if (!product) {
    throw new Error("Product not found");
  }
  return product;
};

/**
 * Create a new product
 * @param {object} productData - The data for the new product
 * @returns {Promise<Product>}
 */
export const createProduct = async (productData) => {
  const newProduct = await Product.create(productData);

  return newProduct;
};

/**
 * Update an existing product
 * @param {number} id - The ID of the product to update
 * @param {object} updateData - The data to update
 * @returns {Promise<Product>}
 */
export const updateProduct = async (id, updateData) => {
  const product = await Product.findByPk(id);

  if (!product) {
    throw new Error("Product not found");
  }

  const updatedProduct = await product.update(updateData);
  return updatedProduct;
};

/**
 * Delete a product
 * @param {number} id - The ID of the product to delete
 * @returns {Promise<{message: string}>}
 */
export const deleteProduct = async (id) => {
  const product = await Product.findByPk(id);

  if (!product) {
    throw new Error("Product not found");
  }

  await product.destroy();
  return { message: "Product deleted successfully" };
};
