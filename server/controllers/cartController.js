import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";

const getOrCreateCart = async (userId) => {
  const [cart] = await Cart.findOrCreate({
    where: { userId },
  });
  return cart;
};

export const get = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.authInfo.id);
    const fullCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: "CartItems",
          include: [
            {
              model: Product,
            },
          ],
        },
      ],
    });
    res.json(fullCart);
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar el carrito", error: error.message });
  }
};

export const add = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({ message: "El ID del producto y la cantidad son obligatorios" });
    }

    const cart = await getOrCreateCart(req.authInfo.id);
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: "No hay suficiente stock disponible" });
    }

    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
      });
    }

    res.status(201).json({ message: "Producto añadido al carrito", item: cartItem });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined) {
      return res.status(400).json({ message: "La cantidad es obligatoria" });
    }

    const cart = await getOrCreateCart(req.authInfo.id);
    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Producto no encontrado en el carrito" });
    }

    if (quantity <= 0) {
      await cartItem.destroy();
      return res.json({ message: "Producto eliminado del carrito" });
    } else {
      const product = await Product.findByPk(productId);
      if (product.stock < quantity) {
        return res.status(400).json({ message: "No hay suficiente stock disponible" });
      }
      cartItem.quantity = quantity;
      await cartItem.save();
      return res.json(cartItem);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.authInfo.id);
    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Producto no encontrado en el carrito" });
    }

    await cartItem.destroy();
    res.json({ message: "Producto eliminado del carrito" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clear = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.authInfo.id);
    await CartItem.destroy({ where: { cartId: cart.id } });
    res.json({ message: "Carrito vaciado con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al vaciar el carrito", error: error.message });
  }
};