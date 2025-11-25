import User from "./User.js";
import Product from "./Product.js";
import Category from "./Category.js";
import Cart from "./Cart.js";
import CartItem from "./CartItem.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";

export default function setupAssociations() {
  // User-Cart Asosiaciones
  User.hasOne(Cart, { foreignKey: "userId" });
  Cart.belongsTo(User, { foreignKey: "userId" });

  // Cart-CartItem-Product Asosiaciones
  Cart.hasMany(CartItem, { foreignKey: "cartId", as: "CartItems" });
  CartItem.belongsTo(Cart, { foreignKey: "cartId" });

  Product.hasMany(CartItem, { foreignKey: "productId" });
  CartItem.belongsTo(Product, { foreignKey: "productId" });

  // User-Order Asosiaciones
  User.hasMany(Order, { foreignKey: "userId" });
  Order.belongsTo(User, { foreignKey: "userId" });

  // Order-OrderItem-Product Asosiaciones
  Order.hasMany(OrderItem, { foreignKey: "orderId", as: "OrderItems" });
  OrderItem.belongsTo(Order, { foreignKey: "orderId" });

  Product.hasMany(OrderItem, { foreignKey: "productId" });
  OrderItem.belongsTo(Product, { foreignKey: "productId" });

  // Category-Product Asosiaciones
  Category.hasMany(Product, { foreignKey: "categoryId" });
  Product.belongsTo(Category, { foreignKey: "categoryId" });
}
