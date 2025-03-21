const express = require("express");
const {
  generateDocuments,
  getDocumentsByIntakeForm,
  getDocument,
  updateDocument,
  updateDocumentSignature,
  deleteDocumentSignature,
  getDocumentsByCategory,
  createStandaloneDocument,
  getStandaloneDocuments,
  addStandaloneSignatures,
  bulkDeleteDocuments,
  permanentlyDeleteDocument,
} = require("../controllers/document");

const { protect } = require("../middleware/auth");

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.route("/generate/:intakeFormId").post(generateDocuments);

router.route("/intake/:intakeFormId").get(getDocumentsByIntakeForm);

// Add new route for getting documents by category
router.route("/category/:category").get(getDocumentsByCategory);

// Standalone documents routes - now with GET and POST
router
  .route("/standalone")
  .get(getStandaloneDocuments)
  .post(createStandaloneDocument);

router.route("/:id").get(getDocument).put(updateDocument);

router.route("/:id/signature").put(updateDocumentSignature);

router.route("/:id/signature/:type").delete(deleteDocumentSignature);
// Add route for standalone document signatures
router.route("/:id/standalone-signatures").post(addStandaloneSignatures);
// Add the permanent delete route for documents
router.route("/:id/permanent").delete(permanentlyDeleteDocument);

// Add the bulk delete route for documents
router.route("/bulk-delete").post(bulkDeleteDocuments);

module.exports = router;
