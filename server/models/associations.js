import User from "./User.js";
import Product from "./Product.js";
import Category from "./Category.js";
import Cart from "./Cart.js";
import CartItem from "./CartItem.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";

export default function setupAssociations() {
  // User-Cart Association
  User.hasOne(Cart, { foreignKey: "userId" });
  Cart.belongsTo(User, { foreignKey: "userId" });

  // Cart-CartItem-Product Associations
  Cart.hasMany(CartItem, { foreignKey: "cartId", as: "CartItems" });
  CartItem.belongsTo(Cart, { foreignKey: "cartId" });

  Product.hasMany(CartItem, { foreignKey: "productId" });
  CartItem.belongsTo(Product, { foreignKey: "productId" });

  // User-Order Association
  User.hasMany(Order, { foreignKey: "userId" });
  Order.belongsTo(User, { foreignKey: "userId" });

  // Order-OrderItem-Product Associations
  Order.hasMany(OrderItem, { foreignKey: "orderId", as: "OrderItems" });
  OrderItem.belongsTo(Order, { foreignKey: "orderId" });

  Product.hasMany(OrderItem, { foreignKey: "productId" });
  OrderItem.belongsTo(Product, { foreignKey: "productId" });

  // Category-Product Association
  Category.hasMany(Product, { foreignKey: "categoryId" });
  Product.belongsTo(Category, { foreignKey: "categoryId" });
}
