import { Parser } from "json2csv";
import excel from "exceljs";
import Order from "../models/Order.js";
import User from "../models/User.js";
import OrderItem from "../models/OrderItem.js";
import Product from "../models/Product.js";

/**
 * Generates a report of all orders in the specified format.
 * @param {'csv' | 'excel'} format - The desired report format.
 * @returns {Promise<{data: string | Buffer, contentType: string, fileName: string}>}
 */
export const generateOrdersReport = async (format) => {
  const orders = await Order.findAll({
    include: [
      { model: User, attributes: ["id", "firstName", "lastName", "email"] },
      { model: OrderItem, include: [{ model: Product, attributes: ["name", "sku"] }] },
    ],
    order: [["createdAt", "DESC"]],
  });

  // Flatten the data for the report
  const reportData = orders.map((order) => ({
    orderId: order.id,
    customerName: `${order.User.firstName} ${order.User.lastName}`,
    customerEmail: order.User.email,
    total: order.total,
    status: order.status,
    orderDate: order.createdAt.toISOString().split("T")[0],
    shippingAddress: `${order.shippingAddress}, ${order.shippingCity}, ${order.shippingState} ${order.shippingPostalCode}`,
    itemCount: order.OrderItems.length,
    items: order.OrderItems.map(
      (item) => `${item.Product.name} (Qty: ${item.quantity})`
    ).join(", "),
  }));

  const timestamp = new Date().toISOString().replace(/:/g, "-");

  if (format === "csv") {
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(reportData);
    return {
      data: csv,
      contentType: "text/csv",
      fileName: `orders-report-${timestamp}.csv`,
    };
  }

  if (format === "excel") {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Orders Report");

    worksheet.columns = [
      { header: "Order ID", key: "orderId", width: 10 },
      { header: "Customer Name", key: "customerName", width: 25 },
      { header: "Customer Email", key: "customerEmail", width: 30 },
      { header: "Total", key: "total", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Order Date", key: "orderDate", width: 15 },
      { header: "Shipping Address", key: "shippingAddress", width: 50 },
      { header: "Item Count", key: "itemCount", width: 10 },
      { header: "Items", key: "items", width: 60 },
    ];

    worksheet.addRows(reportData);

    // Style the header
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return {
      data: buffer,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileName: `orders-report-${timestamp}.xlsx`,
    };
  }

  throw new Error("Invalid report format specified.");
};
