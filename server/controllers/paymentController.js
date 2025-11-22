import Stripe from "stripe";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import User from "../models/User.js";
import { sequelize } from "../config/database.js";
import CartItem from "../models/CartItem.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  const { id: userId } = req.authInfo;

  const { CLIENT_URL, SERVER_URL } = process.env;
  if (!CLIENT_URL || !SERVER_URL) {
    return res.status(500).json({
      error:
        "Las variables de entorno CLIENT_URL y SERVER_URL son necesarias.",
    });
  }

  try {
    const cart = await Cart.findOne({
      where: { userId },
      include: {
        model: CartItem,
        as: "CartItems",
        include: {
          model: Product,
        },
      },
    });

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío." });
    }

    const line_items = cart.CartItems.map((item) => {
      const imageUrl = item.Product.imageUrl
        ? `${SERVER_URL}/uploads/${item.Product.imageUrl}`
        : "https://i.imgur.com/1q2h3p5.png";

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.Product.name,
            images: [imageUrl],
          },
          unit_amount: Math.round(item.Product.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${CLIENT_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/order/cancel`,
      customer_email: user.email,
      metadata: {
        userId: userId,
        cartId: cart.id,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({ error: "Error al crear la sesión de pago." });
  }
};

export const verifyPaymentSession = async (req, res) => {
  const { session_id } = req.body;
  console.log("1. Entrando en verifyPaymentSession con session_id:", session_id);

  if (!session_id) {
    console.log("ERROR: No se proporcionó session_id.");
    return res.status(400).json({ error: "No se proporcionó el ID de la sesión." });
  }

  // Check if order already exists
  try {
    const existingOrder = await Order.findOne({ where: { stripeSessionId: session_id } });
    if (existingOrder) {
      console.log("INFO: El pedido ya existe:", existingOrder.id);
      return res.json({ success: true, orderId: existingOrder.id, message: "El pedido ya ha sido procesado." });
    }
  } catch(e) {
    console.error("ERROR checking for existing order:", e);
    return res.status(500).json({ error: "Error al verificar el pedido." });
  }

  const transaction = await sequelize.transaction();
  console.log("2. Transacción de base de datos iniciada.");

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("3. Sesión de Stripe recuperada:", session.id, "Status:", session.payment_status);

    if (session.payment_status !== "paid") {
      await transaction.rollback();
      console.log("ERROR: El pago no se ha completado. Estado:", session.payment_status);
      return res.status(400).json({ error: "El pago no se ha completado." });
    }

    const userId = session.metadata.userId;
    const cartId = session.metadata.cartId;
    console.log("4. Metadata recuperada:", { userId, cartId });

    const cart = await Cart.findByPk(cartId, {
      include: [{ model: CartItem, as: "CartItems", include: [{ model: Product }] }],
    });

    if (!cart) {
      await transaction.rollback();
      console.log("ERROR: Carrito no encontrado con ID:", cartId);
      return res.status(404).json({ error: "Carrito no encontrado." });
    }
    console.log("5. Carrito encontrado con ID:", cart.id);

    // Stock validation
    for (const item of cart.CartItems) {
      if (item.Product.stock < item.quantity) {
        await transaction.rollback();
        console.log(`ERROR: Stock insuficiente para el producto: ${item.Product.name} (ID: ${item.productId})`);
        return res.status(400).json({ error: "Stock insuficiente para uno de los productos." });
      }
    }
    console.log("6. Validación de stock completada.");

    const order = await Order.create(
      {
        userId,
        total: session.amount_total / 100,
        status: "paid",
        stripeSessionId: session.id,
      },
      { transaction }
    );
    console.log("7. Orden creada con ID:", order.id);

    const orderItems = cart.CartItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.Product.price,
    }));
    console.log("8. Mapeo de OrderItems preparado:", orderItems);


    await OrderItem.bulkCreate(orderItems, { transaction });
    console.log("9. OrderItems guardados en la base de datos.");

    // Stock deduction
    for (const item of cart.CartItems) {
      await Product.update(
        { stock: item.Product.stock - item.quantity },
        { where: { id: item.productId }, transaction }
      );
    }
    console.log("10. Stock de productos actualizado.");

    await CartItem.destroy({ where: { cartId: cart.id }, transaction });
    console.log("11. Carrito limpiado.");

    await transaction.commit();
    console.log("12. Transacción completada (commit). Respondiendo con éxito.");

    res.json({ success: true, orderId: order.id });
  } catch (error) {
    await transaction.rollback();
    console.error("FATAL: Error en el bloque try-catch de verifyPaymentSession:", error);
    res.status(500).json({ error: "Error al procesar el pago." });
  }
};