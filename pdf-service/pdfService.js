// Create this as a new file: pathway-intake/pdf-service/pdfService.js

const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

const app = express();

// Configure middleware
app.use(express.json({ limit: "50mb" }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://pathway-intake-frontend.onrender.com",
    ],
    methods: ["POST"],
    allowedHeaders: ["Content-Type", "Authorization"], // Added Authorization header
  })
);

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Helper function to clean up temporary files
function cleanupTempFiles() {
  if (fs.existsSync(tempDir)) {
    fs.readdir(tempDir, (err, files) => {
      if (err) return console.error("Error reading temp directory:", err);

      // Delete files older than 1 hour
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      files.forEach((file) => {
        const filePath = path.join(tempDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err)
            return console.error(`Error getting stats for ${file}:`, err);

          if (stats.isFile() && stats.mtimeMs < oneHourAgo) {
            fs.unlink(filePath, (err) => {
              if (err) console.error(`Error deleting ${file}:`, err);
            });
          }
        });
      });
    });
  }
}

// Run cleanup every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);

// PDF generation endpoint
app.post("/api/generate-pdf", async (req, res) => {
  let browser = null;
console.log("PDF generation endpoint hit");
// then log the executable path
console.log("Puppeteer executable path:", puppeteer.executablePath());
  try {
    const { html, filename = "document.pdf" } = req.body;

    if (!html) {
      return res.status(400).json({ error: "HTML content is required" });
    }
    console.log("Puppeteer executable path:", puppeteer.executablePath());

    // Launch headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });

    const page = await browser.newPage();

    // Set content and wait for rendering
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Add necessary styles for better PDF rendering
    await page.addStyleTag({
      content: `
        @page {
          margin: 0.5cm;
          size: A4;
        }
        body {
          margin: 0;
          padding: 0;
          background-color: white;
          font-family: Arial, sans-serif;
        }
        .document-container {
          padding: 20px;
          width: 8.27in;
          margin: 0 auto;
        }
      `,
    });

    // Generate PDF with true text preservation
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0.5cm",
        right: "0.5cm",
        bottom: "0.5cm",
        left: "0.5cm",
      },
    });

    // Set response headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    // Send the PDF
    res.send(pdf);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res
      .status(500)
      .json({ error: "Failed to generate PDF", details: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Multiple documents PDF generation endpoint
app.post("/api/generate-multiple-pdf", async (req, res) => {
  let browser = null;
  const tempFiles = [];

  try {
    const { htmlDocuments, filename = "documents.pdf" } = req.body;

    if (
      !htmlDocuments ||
      !Array.isArray(htmlDocuments) ||
      htmlDocuments.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "HTML documents array is required" });
    }

    // Launch headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    // Generate individual PDFs
    const pdfPaths = [];

    for (let i = 0; i < htmlDocuments.length; i++) {
      const html = htmlDocuments[i];
      const page = await browser.newPage();

      // Set content and wait for rendering
      await page.setContent(html, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      // Add necessary styles
      await page.addStyleTag({
        content: `
          @page {
            margin: 0.5cm;
            size: A4;
          }
          body {
            margin: 0;
            padding: 0;
            background-color: white;
            font-family: Arial, sans-serif;
          }
          .document-container {
            padding: 20px;
            width: 8.27in;
            margin: 0 auto;
          }
        `,
      });

      // Generate PDF for this document
      const tempFilePath = path.join(tempDir, `doc-${Date.now()}-${i}.pdf`);

      await page.pdf({
        path: tempFilePath,
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: "0.5cm",
          right: "0.5cm",
          bottom: "0.5cm",
          left: "0.5cm",
        },
      });

      pdfPaths.push(tempFilePath);
      tempFiles.push(tempFilePath);

      await page.close();
    }

    // Merge PDFs using pdf-lib
    const mergedPdf = await PDFDocument.create();

    for (const pdfPath of pdfPaths) {
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();

    // Set response headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    // Send the PDF
    res.send(Buffer.from(mergedPdfBytes));
  } catch (error) {
    console.error("Error generating multiple PDFs:", error);
    res
      .status(500)
      .json({ error: "Failed to generate PDFs", details: error.message });
  } finally {
    // Close browser
    if (browser) {
      await browser.close();
    }

    // Clean up temp files
    tempFiles.forEach((file) => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (err) {
        console.error(`Error deleting temp file ${file}:`, err);
      }
    });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`PDF service running on port ${PORT}`);
  console.log(`PDF endpoint: http://localhost:${PORT}/api/generate-pdf`);
  console.log(
    `Multi-PDF endpoint: http://localhost:${PORT}/api/generate-multiple-pdf`
  );
});
