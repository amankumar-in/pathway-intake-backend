// File: Document.js
const mongoose = require("mongoose");

const CATEGORIES = [
  "Intake Paperwork",
  "Shelter Bed Documents",
  "In House Move",
];

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Document title is required"],
  },
  category: {
    type: String,
    enum: CATEGORIES,
    required: [true, "Document category is required"],
  },
  additionalCategories: [
    {
      type: String,
      enum: CATEGORIES,
    },
  ],
  // Add new fields for standalone documents
  standAlone: {
    type: Boolean,
    default: false,
  },
  createdFor: {
    type: String,
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  intakeForm: {
    type: mongoose.Schema.ObjectId,
    ref: "IntakeForm",
    // Make intakeForm required only when not a standalone document
    required: function () {
      return !this.standAlone;
    },
  },
  signatures: {
    type: Map,
    of: new mongoose.Schema(
      {
        signature: String,
        position: {
          x: Number,
          y: Number,
        },
      },
      { _id: false }
    ),
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Document", DocumentSchema);
