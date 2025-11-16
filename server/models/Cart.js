import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

class Cart extends Model {}

Cart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    sequelize,
    modelName: "Cart",
    tableName: "carts",
    timestamps: true,
    underscored: true,
  }
);

export default Cart;
