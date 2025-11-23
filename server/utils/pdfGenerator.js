import PDFDocument from "pdfkit";
import fs from "fs";

export const streamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};

export const drawHeader = (doc, title, subtitle) => {
  const logoPath = "client/public/e-commerce.png";
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 50 });
  }

  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text(title, { align: "center" });
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(subtitle, { align: "center" });

  doc.moveDown(2);
};

export const drawFooter = (doc) => {
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    const text = `Página ${i + 1} de ${pageCount} | Generado el: ${new Date().toLocaleDateString()}`;
    doc.fontSize(8).font("Helvetica").text(text, doc.page.margins.left, doc.page.height - 50, {
      align: "center",
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
    });
  }
};

export const drawTable = (doc, table, options = {}) => {
  const { headers, rows } = table;
  const {
    headerFontSize = 10,
    rowFontSize = 8,
    cellPadding = 5,
    headerColor = "#d3d3d3",
    rowEvenColor = "#f3f3f3",
    rowOddColor = "#ffffff",
  } = options;

  let tableTop = doc.y;
  let columnSpans = [];

  // Calcular el ancho de las columnas
  doc.fontSize(headerFontSize).font("Helvetica-Bold");
  headers.forEach((header, i) => {
    const textWidth = doc.widthOfString(header);
    columnSpans[i] = textWidth + cellPadding * 2;
  });

  doc.fontSize(rowFontSize).font("Helvetica");
  rows.forEach((row) => {
    row.forEach((cell, i) => {
      if (cell === null || cell === undefined) return;
      const textWidth = doc.widthOfString(String(cell));
      if (textWidth + cellPadding * 2 > columnSpans[i]) {
        columnSpans[i] = textWidth + cellPadding * 2;
      }
    });
  });

  const tableWidth = columnSpans.reduce((acc, width) => acc + width, 0);
  const startX = (doc.page.width - tableWidth) / 2;

  const drawRow = (row, fontSize, isHeader, isEven) => {
    let currentX = startX;
    doc.fontSize(fontSize).font(isHeader ? "Helvetica-Bold" : "Helvetica");

    const rowHeight = Math.max(
        ...row.map((cell, i) => {
          if (cell === null || cell === undefined) return 0;
          return doc.heightOfString(String(cell), {
            width: columnSpans[i] - cellPadding * 2,
          });
        })
      ) + cellPadding * 2;

    // Background color
    doc.save();
    doc.fillColor(isHeader ? headerColor : isEven ? rowEvenColor : rowOddColor).rect(startX, tableTop, tableWidth, rowHeight).fill();
    doc.restore();
    
    // Text and lines
    doc.fillColor("black");
    row.forEach((cell, i) => {
      if (cell === null || cell === undefined) return;
      doc.text(String(cell), currentX + cellPadding, tableTop + cellPadding, {
        width: columnSpans[i] - cellPadding * 2,
        align: "left",
      });
      currentX += columnSpans[i];
    });

    tableTop += rowHeight;
  };

  // Draw header
  drawRow(headers, headerFontSize, true);

  // Draw rows
  rows.forEach((row, i) => drawRow(row, rowFontSize, false, i % 2 === 0));

  doc.y = tableTop;
};
