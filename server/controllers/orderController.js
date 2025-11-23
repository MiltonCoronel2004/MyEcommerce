import { sequelize } from "../config/database.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

/**
 * Crea un nuevo pedido a partir del carrito de un usuario.
 * Este proceso se ejecuta dentro de una transacción de base de datos para garantizar
 * la integridad de los datos. Si cualquier paso falla, toda la operación se revierte.
 */
export const create = async (req, res) => {
  // Inicia una nueva transacción.
  const t = await sequelize.transaction();
  try {
    const userId = req.authInfo.id;

    // Obtiene los datos del usuario y el carrito dentro de la misma transacción.
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: true, msg: "Usuario no encontrado" });
    }

    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: "CartItems",
          include: [Product],
        },
      ],
      transaction: t,
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: true, msg: "El carrito está vacío" });
    }

    // Verifica el stock de cada producto en el carrito antes de continuar.
    let total = 0;
    for (const item of cart.CartItems) {
      if (item.Product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ error: true, msg: `No hay suficiente stock para el producto: ${item.Product.name}` });
      }
      total += item.quantity * item.Product.price;
    }

    // Crea el registro del pedido, denormalizando la dirección del usuario para registros históricos.
    const order = await Order.create(
      {
        userId,
        total,
        status: "pending",
        shippingAddress: user.addressLine1,
        shippingCity: user.city,
        shippingState: user.state,
        shippingPostalCode: user.postalCode,
        shippingCountry: user.country,
      },
      { transaction: t }
    );

    // Crea los items del pedido y actualiza el stock de cada producto.
    for (const item of cart.CartItems) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: item.Product.id,
          quantity: item.quantity,
          price: item.Product.price,
        },
        { transaction: t }
      );

      // Bloquea la fila del producto para evitar condiciones de carrera (race conditions).
      // Esto asegura que si dos pedidos intentan comprar el mismo último artículo en stock,
      // solo uno tendrá éxito y el otro fallará de forma segura.
      const productToUpdate = await Product.findByPk(item.Product.id, { transaction: t, lock: true });
      productToUpdate.stock -= item.quantity;
      await productToUpdate.save({ transaction: t });
    }

    // Limpia el carrito del usuario una vez que el pedido se ha creado con éxito.
    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    // Si todo ha ido bien, confirma la transacción.
    await t.commit();
    res.status(201).json(order);
  } catch (error) {
    // Si algo falla en cualquier punto, revierte todos los cambios en la base de datos.
    await t.rollback();
    res.status(400).json({ error: true, msg: error.message });
  }
};

export const getForUser = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.authInfo.id },
      include: [{ model: OrderItem, as: "OrderItems", include: [Product] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: true, msg: "Error al recuperar los pedidos", details: error.message });
  }
};

export const getByIdForUser = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.authInfo.id },
      include: [{ model: OrderItem, as: "OrderItems", include: [Product] }],
    });
    if (!order) {
      return res.status(404).json({ error: true, msg: "Pedido no encontrado" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: true, msg: error.message });
  }
};

// --- Admin Controllers ---

export const getAllAdmin = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ["id", "firstName", "email"] },
        { model: OrderItem, as: "OrderItems", include: [Product] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: true, msg: "Error al recuperar todos los pedidos", details: error.message });
  }
};

export const updateStatusAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: true, msg: "El estado es obligatorio" });
    }
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: true, msg: "Pedido no encontrado" });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: true, msg: error.message });
  }
};
