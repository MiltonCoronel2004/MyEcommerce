import express from "express";
import cors from "cors";
import "dotenv/config";
import { sequelize } from "./config/database.js";
import "./models/User.js";
import "./models/Product.js";
import "./models/Category.js";
import "./models/Cart.js";
import "./models/CartItem.js";
import "./models/Order.js";
import "./models/OrderItem.js";
import setupAssociations from "./models/associations.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 600,
  })
);

setupAssociations();

app.use("/uploads", (req, res, next) => {
  const filePath = path.join(__dirname, "uploads", req.path);
  const defaultImagePath = path.join(__dirname, "uploads", "computer.png");

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.sendFile(defaultImagePath, (err) => {
        if (err) {
          next();
        }
      });
    } else {
      res.sendFile(filePath);
    }
  });
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payments", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    // Temporarily removed sequelize.sync to prevent "Too many keys" error and table truncation.
    // Ensure your database schema is up-to-date with the models.
    // For production, consider using database migrations.
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  } catch (e) {
    console.error("Unable to connect to the database:", e);
  }
};

startServer();
