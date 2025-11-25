import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import Order from "../models/Order.js";
import User from "../models/User.js";
import OrderItem from "../models/OrderItem.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { streamToBuffer, drawTable, drawHeader, drawFooter } from "../utils/pdfGenerator.js";

const getDashboardStats = async () => {
  const orders = await Order.findAll();
  const users = await User.findAll();
  const products = await Product.findAll();
  const categories = await Category.findAll();

  const totalSales = orders.reduce((acc, order) => acc + parseFloat(order.total), 0);
  const totalOrders = orders.length;
  const totalCustomers = users.filter((u) => u.role !== "admin").length;
  const totalProducts = products.length;
  const totalCategories = categories.length;

  return [
    { metric: "Ventas Totales (USD)", value: `$${totalSales.toFixed(2)}` },
    { metric: "Pedidos Totales", value: totalOrders },
    { metric: "Clientes Totales", value: totalCustomers },
    { metric: "Productos Totales", value: totalProducts },
    { metric: "Categorías Totales", value: totalCategories },
  ];
};

export const exportDashboard = async (req, res) => {
  const { format = "csv" } = req.query;
  const stats = await getDashboardStats();
  const timestamp = new Date().toISOString().replace(/:/g, "-");

  try {
    if (format === "csv") {
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(stats);
      const fileData = Buffer.from(csv).toString("base64");
      res.json({
        filename: `dashboard-report-${timestamp}.csv`,
        fileData,
      });
    } else if (format === "pdf") {
      const doc = new PDFDocument();
      drawHeader(doc, "Reporte del Dashboard", "Estadísticas generales de la tienda");

      const table = {
        headers: ["Métrica", "Valor"],
        rows: stats.map(({ metric, value }) => [metric, value]),
      };

      drawTable(doc, table);
      drawFooter(doc);

      doc.end();
      const buffer = await streamToBuffer(doc);
      const fileData = buffer.toString("base64");
      res.json({
        filename: `dashboard-report-${timestamp}.pdf`,
        fileData,
      });
    }
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};

export const exportOrders = async (req, res) => {
  const { format = "csv" } = req.query;
  const timestamp = new Date().toISOString().replace(/:/g, "-");

  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ["firstName", "email"] },
        {
          model: OrderItem,
          as: "OrderItems",
          include: [
            {
              model: Product,
              attributes: ["name"],
              include: [{ model: Category, attributes: ["name"] }],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const reportData = orders.map((order) => ({
      ID: order.id,
      Cliente: `${order.User.firstName} (${order.User.email})`,
      Total: `$${order.total}`,
      Estado: order.status,
      Fecha: order.createdAt.toLocaleDateString(),
      Items: order.OrderItems.map((item) => `${item.quantity}x ${item.Product.name} (${item.Product.Category.name})`).join("\n"),
    }));

    if (format === "csv") {
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(reportData);
      const fileData = Buffer.from(csv).toString("base64");
      res.json({
        filename: `orders-report-${timestamp}.csv`,
        fileData,
      });
    } else if (format === "pdf") {
      const doc = new PDFDocument({ layout: "landscape" });
      drawHeader(doc, "Reporte de Pedidos", "Lista detallada de todos los pedidos");

      const table = {
        headers: ["ID", "Cliente", "Total", "Estado", "Fecha", "Items"],
        rows: reportData.map((order) => [order.ID, order.Cliente, order.Total, order.Estado, order.Fecha, order.Items]),
      };

      drawTable(doc, table);
      drawFooter(doc);

      doc.end();
      const buffer = await streamToBuffer(doc);
      const fileData = buffer.toString("base64");
      res.json({
        filename: `orders-report-${timestamp}.pdf`,
        fileData,
      });
    } else {
      res.status(400).json({ error: true, msg: "Invalid format" });
    }
  } catch (e) {
    res.status(500).json({ error: true, msg: e.message });
  }
};
