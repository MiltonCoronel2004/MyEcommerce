import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import Order from "../models/Order.js";
import User from "../models/User.js";
import OrderItem from "../models/OrderItem.js";
import Product from "../models/Product.js";

// Helper to get a buffer from a stream
const streamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};

const getDashboardStats = async () => {
  const orders = await Order.findAll();
  const users = await User.findAll();
  const totalSales = orders.reduce((acc, order) => acc + parseFloat(order.total), 0);
  const totalOrders = orders.length;
  const totalCustomers = users.filter((u) => u.role !== "admin").length;
  return [
    { metric: "Ventas Totales (USD)", value: totalSales.toFixed(2) },
    { metric: "Pedidos Totales", value: totalOrders },
    { metric: "Clientes Totales", value: totalCustomers },
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
      doc.fontSize(25).text("Reporte del Dashboard", { align: "center" });
      doc.moveDown();
      stats.forEach(({ metric, value }) => {
        doc.fontSize(16).text(`${metric}: ${value}`);
        doc.moveDown(0.5);
      });
      doc.end();
      const buffer = await streamToBuffer(doc);
      const fileData = buffer.toString("base64");
      res.json({
        filename: `dashboard-report-${timestamp}.pdf`,
        fileData,
      });
    } else {
      res.status(400).json({ error: "Invalid format" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error generating report", msg: error.message });
  }
};

export const exportOrders = async (req, res) => {
  const { format = "csv" } = req.query;
  const timestamp = new Date().toISOString().replace(/:/g, "-");

  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ["firstName", "email"] },
        { model: OrderItem, include: [{ model: Product, attributes: ["name"] }] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const reportData = orders.map((order) => ({
      ID: order.id,
      Cliente: `${order.User.firstName} (${order.User.email})`,
      Total: order.total,
      Estado: order.status,
      Fecha: order.createdAt.toLocaleDateString(),
      Items: order.OrderItems.map(item => `${item.quantity}x ${item.Product.name}`).join(", "),
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
      const doc = new PDFDocument({ layout: 'landscape' });
      doc.fontSize(20).text("Reporte de Pedidos", { align: "center" });
      doc.moveDown();
      const tableTop = 100;
      const headers = ["ID", "Cliente", "Total", "Estado", "Fecha", "Items"];
      const columnWidths = [40, 150, 60, 70, 80, 250];

      let currentX = 50;
      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, currentX, tableTop);
        currentX += columnWidths[i];
      });
      doc.font('Helvetica');

      let currentY = tableTop + 20;
      reportData.forEach(row => {
        currentX = 50;
        doc.fontSize(8);
        headers.forEach((header, i) => {
          doc.text(String(row[header] || ''), currentX, currentY, { width: columnWidths[i] - 5, align: 'left' });
          currentX += columnWidths[i];
        });
        currentY += 40;
        if (currentY > 500) {
          doc.addPage({ layout: 'landscape' });
          currentY = 50;
        }
      });
      doc.end();
      const buffer = await streamToBuffer(doc);
      const fileData = buffer.toString("base64");
      res.json({
        filename: `orders-report-${timestamp}.pdf`,
        fileData,
      });
    } else {
      res.status(400).json({ error: "Invalid format" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error generating report", msg: error.message });
  }
};
