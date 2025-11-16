import * as cartService from "../services/cartService.js";

// Get the user's cart
export const get = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving cart", error: error.message });
  }
};

// Add an item to the cart
export const add = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({ message: "productId and quantity are required" });
    }
    const item = await cartService.addProductToCart(req.user.id, productId, quantity);
    res.status(201).json({ message: "Product added to cart", item });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an item's quantity in the cart
export const update = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined) {
        return res.status(400).json({ message: "quantity is required" });
    }
    const result = await cartService.updateProductQuantity(req.user.id, productId, quantity);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove an item from the cart
export const remove = async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await cartService.removeProductFromCart(req.user.id, productId);
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Clear the entire cart
export const clear = async (req, res) => {
  try {
    const result = await cartService.clearCart(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
};
