import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

class CartItem extends Model {}

CartItem.init(
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    modelName: "CartItem",
    tableName: "cart_items",
    timestamps: true,
    underscored: true,
  }
);

export default CartItem;
