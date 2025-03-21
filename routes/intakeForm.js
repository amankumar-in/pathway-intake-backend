const express = require("express");
const {
  createIntakeForm,
  getIntakeForms,
  getIntakeForm,
  updateIntakeForm,
  deleteIntakeForm,
  updateSignature,
  updateFormStatus,
  toggleFormArchive,
  bulkDeleteIntakeForms,
  permanentlyDeleteIntakeForm,
} = require("../controllers/intakeForm");

const { protect } = require("../middleware/auth");

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router.route("/").get(getIntakeForms).post(createIntakeForm);

router
  .route("/:id")
  .get(getIntakeForm)
  .put(updateIntakeForm)
  .delete(deleteIntakeForm);

router.route("/:id/signature").put(updateSignature);
// Routes for status and archive
router.route("/:id/status").put(updateFormStatus);
router.route("/:id/archive").put(toggleFormArchive);
// Add the permanent delete route for intake forms
router.route("/:id/permanent").delete(permanentlyDeleteIntakeForm);

// Add the bulk delete route for intake forms
router.route("/bulk-delete").post(bulkDeleteIntakeForms);

module.exports = router;
