import { sequelize } from "../config/database.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

/**
 * Create an order from a user's cart
 * @param {number} userId
 * @returns {Promise<Order>}
 */
export const createOrder = async (userId) => {
  const t = await sequelize.transaction();

  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    const cart = await Cart.findOne({
      where: { userId },
      include: [{ model: CartItem, as: "CartItems", include: [Product] }],
      transaction: t,
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    let total = 0;
    for (const item of cart.CartItems) {
      if (item.Product.stock < item.quantity) {
        throw new Error(`Not enough stock for product: ${item.Product.name}`);
      }
      total += item.quantity * item.Product.price;
    }

    const order = await Order.create(
      {
        userId,
        total,
        status: "pending",
        // Assuming shipping details are stored on the user model for simplicity
        shippingAddress: user.addressLine1,
        shippingCity: user.city,
        shippingState: user.state,
        shippingPostalCode: user.postalCode,
        shippingCountry: user.country,
      },
      { transaction: t }
    );

    for (const item of cart.CartItems) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.Product.price,
        },
        { transaction: t }
      );

      // Decrement stock
      const product = await Product.findByPk(item.productId, { transaction: t });
      product.stock -= item.quantity;
      await product.save({ transaction: t });
    }

    // Clear the cart
    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    await t.commit();
    return order;
  } catch (error) {
    await t.rollback();
    throw error; // Re-throw the error to be caught by the controller
  }
};

/**
 * Get all orders for a specific user
 * @param {number} userId
 */
export const getOrdersForUser = async (userId) => {
  return Order.findAll({
    where: { userId },
    include: [{ model: OrderItem, include: [Product] }],
    order: [["createdAt", "DESC"]],
  });
};

/**
 * Get a single order by ID for a specific user
 * @param {number} orderId
 * @param {number} userId
 */
export const getOrderByIdForUser = async (orderId, userId) => {
  const order = await Order.findOne({
    where: { id: orderId, userId },
    include: [{ model: OrderItem, include: [Product] }],
  });

  if (!order) {
    throw new Error("Order not found");
  }
  return order;
};

// --- Admin Functions ---

/**
 * Get all orders in the system (Admin)
 */
export const getAllOrdersAdmin = async () => {
  return Order.findAll({
    include: [{ model: User, attributes: ["id", "firstName", "email"] }],
    order: [["createdAt", "DESC"]],
  });
};

/**
 * Update the status of an order (Admin)
 * @param {number} orderId
 * @param {string} status
 */
export const updateOrderStatusAdmin = async (orderId, status) => {
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  order.status = status;
  await order.save();
  return order;
};
