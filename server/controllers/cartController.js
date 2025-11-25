import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";

export const get = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.authInfo.id } });
    if (!cart) return res.json({ id: null, userId: req.authInfo.id, CartItems: [] });

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
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const add = async (req, res) => {
  if (req.authInfo.role === "admin") return res.status(403).json({ error: true, msg: "Los administradores no pueden añadir productos al carrito." });

  try {
    const { productId, quantity } = req.body;

    const [cart] = await Cart.findOrCreate({
      where: { userId: req.authInfo.id },
    });

    const product = await Product.findByPk(productId);

    if (!product) return res.status(404).json({ error: true, msg: "Producto no encontrado" });

    // Busca si el producto ya existe en el carrito.
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (cartItem) {
      // Si el producto ya está en el carrito, se actualiza la cantidad.
      const newQuantity = cartItem.quantity + quantity;
      // Se comprueba que la nueva cantidad total no supere el stock disponible.
      if (product.stock < newQuantity) return res.status(400).json({ error: true, msg: "No hay suficiente stock disponible" });

      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      // Si es un producto nuevo en el carrito, se crea el item.
      // Se comprueba que la cantidad inicial no supere el stock disponible.
      if (product.stock < quantity) return res.status(400).json({ error: true, msg: "No hay suficiente stock disponible" });

      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
      });
    }

    // Devuelve el carrito completo y actualizado para refrescar la UI del cliente.
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
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const update = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined) return res.status(400).json({ error: true, msg: "La cantidad es obligatoria" });

    // Para actualizar, el carrito debe existir.
    const cart = await Cart.findOne({ where: { userId: req.authInfo.id } });
    if (!cart) return res.status(404).json({ error: true, msg: "El carrito no existe" });

    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (!cartItem) return res.status(404).json({ error: true, msg: "Producto no encontrado en el carrito" });

    if (quantity <= 0) {
      await cartItem.destroy();
      return res.json({ error: false, message: "Producto eliminado del carrito" });
    }

    const product = await Product.findByPk(productId);
    if (product.stock < quantity) return res.status(400).json({ error: true, msg: "No hay suficiente stock disponible" });

    cartItem.quantity = quantity;
    await cartItem.save();
    return res.json(cartItem);
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ where: { userId: req.authInfo.id } });
    if (!cart) return res.status(404).json({ error: true, message: "El carrito no existe" });
    const cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (!cartItem) return res.status(404).json({ error: true, msg: "Producto no encontrado en el carrito" });

    await cartItem.destroy();
    res.json({ error: false, message: "Producto eliminado del carrito" });
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const clear = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.authInfo.id } });
    if (!cart) return res.status(404).json({ error: true, message: "El carrito no existe" });
    await CartItem.destroy({ where: { cartId: cart.id } });
    res.json({ error: false, message: "Carrito vaciado con éxito" });
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};
