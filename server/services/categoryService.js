import Category from "../models/Category.js";
import Product from "../models/Product.js";

/**
 * Get all categories
 * @returns {Promise<Category[]>}
 */
export const getAllCategories = async () => {
  return Category.findAll();
};

/**
 * Get a single category by its ID, including its products
 * @param {number} id - The ID of the category
 * @returns {Promise<Category>}
 */
export const getCategoryById = async (id) => {
  const category = await Category.findByPk(id, {
    include: [{ model: Product }],
  });

  if (!category) {
    throw new Error("Category not found");
  }
  return category;
};

/**
 * Create a new category
 * @param {object} categoryData - The data for the new category (name, description)
 * @returns {Promise<Category>}
 */
export const createCategory = async (categoryData) => {
  const newCategory = await Category.create(categoryData);
  return newCategory;
};

/**
 * Update an existing category
 * @param {number} id - The ID of the category to update
 * @param {object} updateData - The data to update
 * @returns {Promise<Category>}
 */
export const updateCategory = async (id, updateData) => {
  const category = await Category.findByPk(id);

  if (!category) {
    throw new Error("Category not found");
  }

  const updatedCategory = await category.update(updateData);
  return updatedCategory;
};

/**
 * Delete a category
 * @param {number} id - The ID of the category to delete
 * @returns {Promise<{message: string}>}
 */
export const deleteCategory = async (id) => {
  const category = await Category.findByPk(id);

  if (!category) {
    throw new Error("Category not found");
  }

  // Optional: Check if category has products before deleting
  const products = await Product.count({ where: { categoryId: id } });
  if (products > 0) {
    throw new Error("Cannot delete category with associated products.");
  }

  await category.destroy();
  return { message: "Category deleted successfully" };
};
