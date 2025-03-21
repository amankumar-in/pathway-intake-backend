const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import DB connection
const connectDB = require("./config/db");

// Import route files
const authRoutes = require("./routes/auth");
const intakeFormRoutes = require("./routes/intakeForm");
const documentRoutes = require("./routes/document");
const pdfRoutes = require("./routes/pdf");

// Create Express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased limit for signatures
app.use(express.urlencoded({ extended: true }));

// Mount routers
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/intake-forms", intakeFormRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/pdf", pdfRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Pathway Foster Agency API is running");
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || "Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// test path for puppeteer
app.get("/test-puppeteer-path", (req, res) => {
  const path = puppeteer.executablePath();
  console.log("Test Puppeteer path:", path);
  res.send(`Puppeteer executable path: ${path}`);
});
