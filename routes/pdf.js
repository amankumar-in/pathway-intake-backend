// Create this file at pathway-intake/backend/routes/pdf.js

const express = require("express");
const router = express.Router();
const {
  generatePDF,
  generateMultiplePDF,
  generateDocumentPDF,
} = require("../controllers/pdf");
const { protect } = require("../middleware/auth");

// @route   POST /api/v1/pdf/generate
// @desc    Generate PDF from HTML
// @access  Private
router.post("/generate", protect, generatePDF);

// @route   POST /api/v1/pdf/generate-multiple
// @desc    Generate PDF from multiple HTML documents
// @access  Private
router.post("/generate-multiple", protect, generateMultiplePDF);

// @route   GET /api/v1/pdf/document/:id
// @desc    Generate PDF for a specific document
// @access  Private
router.get("/document/:id", protect, generateDocumentPDF);

module.exports = router;
