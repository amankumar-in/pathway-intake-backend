const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const puppeteer = require("puppeteer");
const fs = require("fs");
const cookieParser = require("cookie-parser");

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

// Connect to database and seed default admin
const User = require("./models/User");

const startServer = async () => {
  await connectDB();

  // Create default admin user if none exists
  const adminExists = await User.findOne({ username: "admin" });
  if (!adminExists) {
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;
    if (!adminPassword) {
      console.warn("WARNING: No ADMIN_DEFAULT_PASSWORD set in env. Skipping admin creation.");
    } else {
      await User.create({
        username: "admin",
        password: adminPassword,
        name: "Admin",
        role: "admin",
      });
      console.log("Default admin user created");
    }
  }
};

startServer();

// Middleware
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// Mount routers
app.use("/api/v1/pdf", express.json({ limit: "50mb" }), pdfRoutes);
app.use(express.json({ limit: "1mb" })); // Reduced global limit
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/intake-forms", intakeFormRoutes);
app.use("/api/v1/documents", documentRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Pathway Foster Agency API is running");
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Server Error" : (err.message || "Server Error"),
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
