import { sequelize } from "../config/database.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.authInfo.id;
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const cart = await Cart.findOne({
      where: { userId },
      include: [{ model: CartItem, as: "CartItems", include: [Product] }],
      transaction: t,
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "El carrito está vacío" });
    }

    let total = 0;
    for (const item of cart.CartItems) {
      if (item.Product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ message: `No hay suficiente stock para el producto: ${item.Product.name}` });
      }
      total += item.quantity * item.Product.price;
    }

    const order = await Order.create({
      userId,
      total,
      status: "pending",
      shippingAddress: user.addressLine1,
      shippingCity: user.city,
      shippingState: user.state,
      shippingPostalCode: user.postalCode,
      shippingCountry: user.country,
    }, { transaction: t });

    for (const item of cart.CartItems) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.Product.price,
      }, { transaction: t });

      const product = await Product.findByPk(item.productId, { transaction: t, lock: true });
      product.stock -= item.quantity;
      await product.save({ transaction: t });
    }

    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    await t.commit();
    res.status(201).json(order);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ message: error.message });
  }
};

export const getForUser = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.authInfo.id },
      include: [{ model: OrderItem, include: [Product] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar los pedidos" });
  }
};

export const getByIdForUser = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.authInfo.id },
      include: [{ model: OrderItem, include: [Product] }],
    });
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Admin Controllers ---

export const getAllAdmin = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ["id", "firstName", "email"] },
        { model: OrderItem, include: [Product] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar todos los pedidos" });
  }
};

export const updateStatusAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "El estado es obligatorio" });
    }
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};