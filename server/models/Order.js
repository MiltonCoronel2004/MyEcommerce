import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'shipped', 'cancelled'),
      defaultValue: 'pending',
    },
    stripeSessionId: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    shippingAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingCity: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingState: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingPostalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingCountry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: true,
    underscored: true,
  }
);

export default Order;
