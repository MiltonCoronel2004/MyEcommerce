import Stripe from "stripe";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import User from "../models/User.js";
import { sequelize } from "../config/database.js";
import CartItem from "../models/CartItem.js";

import { Resend } from "resend";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createCheckoutSession = async (req, res) => {
  const { id: userId } = req.authInfo;

  const { CLIENT_URL, SERVER_URL } = process.env;
  if (!CLIENT_URL || !SERVER_URL)
    return res.status(500).json({
      error: true,
      msg: "Las variables de entorno CLIENT_URL y SERVER_URL son necesarias.",
    });

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

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) return res.status(400).json({ error: true, msg: "El carrito está vacío." });

    const line_items = cart.CartItems.map((item) => {
      const imageUrl = item.Product.imageUrl ? `${SERVER_URL}/uploads/${item.Product.imageUrl}` : `${SERVER_URL}/uploads/computer.png`;

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
    if (!user) return res.status(404).json({ error: true, msg: "Usuario no encontrado." });

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
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const verifyPaymentSession = async (req, res) => {
  const { session_id } = req.body;
  if (!session_id) return res.status(400).json({ error: true, msg: "No se proporcionó el ID de la sesión." });

  try {
    const existingOrder = await Order.findOne({ where: { stripeSessionId: session_id } });
    if (existingOrder) return res.json({ success: true, orderId: existingOrder.id, message: "El pedido ya ha sido procesado." });
  } catch (e) {
    return res.status(500).json({ error: true, msg: e.message });
  }

  const transaction = await sequelize.transaction();

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      await transaction.rollback();
      return res.status(400).json({ error: true, msg: "El pago no se ha completado." });
    }

    const userId = session.metadata.userId;
    const cartId = session.metadata.cartId;

    const cart = await Cart.findByPk(cartId, {
      include: [{ model: CartItem, as: "CartItems", include: [{ model: Product }] }],
    });

    if (!cart) {
      await transaction.rollback();
      return res.status(404).json({ error: true, msg: "Carrito no encontrado." });
    }

    for (const item of cart.CartItems) {
      if (item.Product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ error: true, msg: "Stock insuficiente para uno de los productos." });
      }
    }

    const order = await Order.create(
      {
        userId,
        total: session.amount_total / 100,
        status: "paid",
        stripeSessionId: session.id,
      },
      { transaction }
    );

    const orderItems = cart.CartItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.Product.price,
    }));

    await OrderItem.bulkCreate(orderItems, { transaction });

    for (const item of cart.CartItems) {
      await Product.update({ stock: item.Product.stock - item.quantity }, { where: { id: item.productId }, transaction });
    }

    await CartItem.destroy({ where: { cartId: cart.id }, transaction });

    await transaction.commit();

    // Enviar correo de confirmación
    try {
      const fullOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: User,
            attributes: ["firstName", "lastName", "email"],
          },
          {
            model: OrderItem,
            as: "OrderItems",
            include: [
              {
                model: Product,
                attributes: ["name"],
              },
            ],
          },
        ],
      });

      const emailTemplatePath = path.join(__dirname, "../templates/receipt.html");
      let html = await fs.readFile(emailTemplatePath, "utf-8");

      const itemsHtml = fullOrder.OrderItems.map(
        (item) => `
        <tr>
          <td>${item.Product.name}</td>
          <td>${item.quantity}</td>
          <td>$${Number(item.price).toFixed(2)}</td>
          <td>$${(item.quantity * Number(item.price)).toFixed(2)}</td>
        </tr>
      `
      ).join("");

      html = html.replace("{{orderId}}", fullOrder.id);
      html = html.replace("{{orderDate}}", new Date(fullOrder.createdAt).toLocaleDateString("es-ES"));
      html = html.replace("{{customerName}}", `${fullOrder.User.firstName} ${fullOrder.User.lastName}`);
      html = html.replace("{{customerEmail}}", fullOrder.User.email);
      html = html.replace("{{items}}", itemsHtml);
      html = html.replace("{{total}}", `$${Number(fullOrder.total).toFixed(2)}`);

      // TODO: Cambiar a fullOrder.User.email cuando Resend permita enviar a cualquier correo.
      // Por ahora, se usa un correo de prueba hardcodeado.
      await resend.emails.send({
        from: "MyEcommerce <onboarding@resend.dev>",
        to: "miltoncoronel2004@gmail.com",
        subject: `Confirmación de tu pedido #${fullOrder.id}`,
        html: html,
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // No devolver un error al cliente, ya que el pago fue exitoso.
      // Simplemente registrar el error.
    }

    res.json({ success: true, orderId: order.id });
  } catch (e) {
    await transaction.rollback();
    res.status(500).json({ error: true, msg: e.message });
  }
};
