import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

/**
 * Get or create a cart for a user
 * @param {number} userId
 * @returns {Promise<Cart>}
 */
const getOrCreateCart = async (userId) => {
  const [cart] = await Cart.findOrCreate({
    where: { userId },
  });
  return cart;
};

/**
 * Get the user's cart with all its items and product details
 * @param {number} userId
 */
export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return Cart.findByPk(cart.id, {
    include: [
      {
        model: CartItem,
        as: "CartItems", // Use the alias if you defined one in associations
        include: [
          {
            model: Product,
          },
        ],
      },
    ],
  });
};

/**
 * Add a product to the cart or update its quantity
 * @param {number} userId
 * @param {number} productId
 * @param {number} quantity
 */
export const addProductToCart = async (userId, productId, quantity) => {
  const cart = await getOrCreateCart(userId);
  const product = await Product.findByPk(productId);

  if (!product) {
    throw new Error("Product not found");
  }
  if (product.stock < quantity) {
    throw new Error("Not enough stock available");
  }

  let cartItem = await CartItem.findOne({
    where: { cartId: cart.id, productId },
  });

  if (cartItem) {
    // Update quantity if item already exists
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    // Create new cart item
    cartItem = await CartItem.create({
      cartId: cart.id,
      productId,
      quantity,
    });
  }

  return cartItem;
};

/**
 * Update a product's quantity in the cart
 * @param {number} userId
 * @param {number} productId
 * @param {number} quantity
 */
export const updateProductQuantity = async (userId, productId, quantity) => {
  const cart = await getOrCreateCart(userId);
  const cartItem = await CartItem.findOne({
    where: { cartId: cart.id, productId },
  });

  if (!cartItem) {
    throw new Error("Product not found in cart");
  }

  if (quantity <= 0) {
    // If quantity is 0 or less, remove the item
    await cartItem.destroy();
    return { message: "Product removed from cart" };
  } else {
    const product = await Product.findByPk(productId);
    if (product.stock < quantity) {
      throw new Error("Not enough stock available");
    }
    cartItem.quantity = quantity;
    await cartItem.save();
    return cartItem;
  }
};

/**
 * Remove a product from the cart
 * @param {number} userId
 * @param {number} productId
 */
export const removeProductFromCart = async (userId, productId) => {
  const cart = await getOrCreateCart(userId);
  const cartItem = await CartItem.findOne({
    where: { cartId: cart.id, productId },
  });

  if (!cartItem) {
    throw new Error("Product not found in cart");
  }

  await cartItem.destroy();
  return { message: "Product removed from cart" };
};

/**
 * Clear all items from the cart
 * @param {number} userId
 */
export const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  await CartItem.destroy({ where: { cartId: cart.id } });
  return { message: "Cart cleared successfully" };
};
