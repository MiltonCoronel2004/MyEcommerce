import User from "./User.js";
import Product from "./Product.js";
import Category from "./Category.js";
import Cart from "./Cart.js";
import CartItem from "./CartItem.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";

export default function setupAssociations() {
  // User-Cart Association (One-to-One)
  User.hasOne(Cart, { foreignKey: "userId" });
  Cart.belongsTo(User, { foreignKey: "userId" });

  // Cart-Product Association (Many-to-Many through CartItem)
  Cart.belongsToMany(Product, { through: CartItem, foreignKey: "cartId" });
  Product.belongsToMany(Cart, { through: CartItem, foreignKey: "productId" });

  // User-Order Association (One-to-Many)
  User.hasMany(Order, { foreignKey: "userId" });
  Order.belongsTo(User, { foreignKey: "userId" });

  // Order-Product Association (Many-to-Many through OrderItem)
  Order.belongsToMany(Product, { through: OrderItem, foreignKey: "orderId" });
  Product.belongsToMany(Order, { through: OrderItem, foreignKey: "productId" });
  Order.hasMany(OrderItem, { foreignKey: "orderId" });
  OrderItem.belongsTo(Order, { foreignKey: "orderId" });

  // Category-Product Association (One-to-Many)
  Category.hasMany(Product, { foreignKey: "categoryId" });
  Product.belongsTo(Category, { foreignKey: "categoryId" });
}
