import * as reportService from "../services/reportService.js";

export const downloadOrdersReport = async (req, res) => {
  try {
    const format = req.query.format || "csv"; // Default to CSV
    if (format !== "csv" && format !== "excel") {
      return res.status(400).json({ message: "Invalid format. Must be 'csv' or 'excel'." });
    }

    const { data, contentType, fileName } = await reportService.generateOrdersReport(format);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    res.send(data);
  } catch (error) {
    res.status(500).json({ message: "Error generating report", error: error.message });
  }
};
