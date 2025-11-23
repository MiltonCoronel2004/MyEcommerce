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
    res.status(500).json({ error: true, msg: "Error al recuperar el carrito", details: error.message });
  }
};

export const add = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await getOrCreateCart(req.authInfo.id);
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ error: true, msg: "Producto no encontrado" });
    }

    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      // Si el item ya existe, validar stock contra la cantidad total
      const newQuantity = cartItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ error: true, msg: "No hay suficiente stock disponible" });
      }
      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      // Si es un item nuevo, validar stock contra la cantidad inicial
      if (product.stock < quantity) {
        return res.status(400).json({ error: true, msg: "No hay suficiente stock disponible" });
      }
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
      });
    }

    // Devolver el carrito completo y actualizado
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

    res.status(200).json({ error: false, msg: "Producto añadido al carrito", cart: fullCart });
  } catch (error) {
    res.status(400).json({ error: true, msg: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined) {
      return res.status(400).json({ error: true, msg: "La cantidad es obligatoria" });
    }

    const cart = await getOrCreateCart(req.authInfo.id);
    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (!cartItem) {
      return res.status(404).json({ error: true, msg: "Producto no encontrado en el carrito" });
    }

    if (quantity <= 0) {
      await cartItem.destroy();
      return res.json({ error: false, messsage: "Producto eliminado del carrito" });
    } else {
      const product = await Product.findByPk(productId);
      if (product.stock < quantity) {
        return res.status(400).json({ error: true, msg: "No hay suficiente stock disponible" });
      }
      cartItem.quantity = quantity;
      await cartItem.save();
      return res.json(cartItem);
    }
  } catch (error) {
    res.status(400).json({ error: true, msg: error.message });
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
      return res.status(404).json({ error: true, msg: "Producto no encontrado en el carrito" });
    }

    await cartItem.destroy();
    res.json({ error: false, messsage: "Producto eliminado del carrito" });
  } catch (error) {
    res.status(500).json({ error: true, msg: error.message });
  }
};

export const clear = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.authInfo.id);
    await CartItem.destroy({ where: { cartId: cart.id } });
    res.json({ error: false, messsage: "Carrito vaciado con éxito" });
  } catch (error) {
    res.status(500).json({ error: true, msg: "Error al vaciar el carrito", details: error.message });
  }
};
