const IntakeForm = require("../models/IntakeForm");

// @desc    Create new intake form
// @route   POST /api/v1/intake-forms
// @access  Private
exports.createIntakeForm = async (req, res, next) => {
  try {
    // Add current user as creator
    req.body.createdBy = req.user.id;

    const intakeForm = await IntakeForm.create(req.body);

    res.status(201).json({
      success: true,
      data: intakeForm,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all intake forms
// @route   GET /api/v1/intake-forms
// @access  Private
exports.getIntakeForms = async (req, res, next) => {
  try {
    let query;

    // If user is not admin, only show their forms
    if (req.user.role !== "admin") {
      query = IntakeForm.find({ createdBy: req.user.id });
    } else {
      query = IntakeForm.find();
    }

    // Add populate for user info
    query = query.populate({
      path: "createdBy",
      select: "name username",
    });

    const intakeForms = await query;

    res.status(200).json({
      success: true,
      count: intakeForms.length,
      data: intakeForms,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single intake form
// @route   GET /api/v1/intake-forms/:id
// @access  Private
exports.getIntakeForm = async (req, res, next) => {
  try {
    const intakeForm = await IntakeForm.findById(req.params.id).populate({
      path: "createdBy",
      select: "name username",
    });

    if (!intakeForm) {
      return res.status(404).json({
        success: false,
        message: "Intake form not found",
      });
    }

    // Make sure user is owner or admin
    if (
      intakeForm.createdBy._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this intake form",
      });
    }

    res.status(200).json({
      success: true,
      data: intakeForm,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update intake form
// @route   PUT /api/v1/intake-forms/:id
// @access  Private
exports.updateIntakeForm = async (req, res, next) => {
  try {
    let intakeForm = await IntakeForm.findById(req.params.id);

    if (!intakeForm) {
      return res.status(404).json({
        success: false,
        message: "Intake form not found",
      });
    }

    // Make sure user is owner or admin
    if (
      intakeForm.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this intake form",
      });
    }

    // Add updatedBy and updatedAt
    req.body.updatedBy = req.user.id;
    req.body.updatedAt = Date.now();

    // Update the form
    intakeForm = await IntakeForm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: intakeForm,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete intake form
// @route   DELETE /api/v1/intake-forms/:id
// @access  Private
exports.deleteIntakeForm = async (req, res, next) => {
  try {
    const intakeForm = await IntakeForm.findById(req.params.id);

    if (!intakeForm) {
      return res.status(404).json({
        success: false,
        message: "Intake form not found",
      });
    }

    // Make sure user is owner or admin
    if (
      intakeForm.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this intake form",
      });
    }

    await intakeForm.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update signature on intake form
// @route   PUT /api/v1/intake-forms/:id/signature
// @access  Private
exports.updateSignature = async (req, res, next) => {
  try {
    const { signatureType, signatureData } = req.body;

    // Validate signature type
    const validSignatureTypes = [
      "childSignature",
      "parentSignature",
      "caseworkerSignature",
      "supervisorSignature",
      "agencyRepSignature",
    ];

    if (!validSignatureTypes.includes(signatureType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature type",
      });
    }

    let intakeForm = await IntakeForm.findById(req.params.id);

    if (!intakeForm) {
      return res.status(404).json({
        success: false,
        message: "Intake form not found",
      });
    }

    // Update the signature
    const updateData = {
      [`signatures.${signatureType}`]: signatureData,
      updatedBy: req.user.id,
      updatedAt: Date.now(),
    };

    intakeForm = await IntakeForm.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: intakeForm,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update signature label for an intake form
// @route   PUT /api/intake-forms/:id/signature-label
// @access  Private
exports.updateSignatureLabel = async (req, res, next) => {
  try {
    const { signatureType, label } = req.body;

    // Validate signature type
    const validSignatureTypes = [
      "childSignature",
      "parentSignature",
      "caseworkerSignature",
      "supervisorSignature",
      "agencyRepSignature",
    ];

    if (!validSignatureTypes.includes(signatureType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature type",
      });
    }

    let intakeForm = await IntakeForm.findById(req.params.id);

    if (!intakeForm) {
      return res.status(404).json({
        success: false,
        message: "Intake form not found",
      });
    }

    // Update the signature label
    const updateData = {
      [`signatureLabels.${signatureType}`]: label,
      updatedBy: req.user.id,
      updatedAt: Date.now(),
    };

    intakeForm = await IntakeForm.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: intakeForm,
    });
  } catch (err) {
    next(err);
  }
};

// Add these controller functions to your intakeForm.js controller file

/**
 * @desc    Update form status
 * @route   PUT /api/v1/intake-forms/:id/status
 * @access  Private
 */
exports.updateFormStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "In Progress",
      "Completed",
      "Pending",
      "Needs Review",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Find and update the form
    const form = await IntakeForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    // Update the form status and lastStatusUpdate
    form.status = status;
    form.lastStatusUpdate = Date.now();
    form.updatedBy = req.user.id;
    form.updatedAt = Date.now();

    await form.save();

    res.status(200).json({
      success: true,
      data: form,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @desc    Toggle form archive status
 * @route   PUT /api/v1/intake-forms/:id/archive
 * @access  Private
 */
exports.toggleFormArchive = async (req, res) => {
  try {
    const { archived } = req.body;

    if (typeof archived !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Archived must be a boolean value",
      });
    }

    // Find and update the form
    const form = await IntakeForm.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    // Update archive status
    form.archived = archived;
    form.updatedBy = req.user.id;
    form.updatedAt = Date.now();

    // If archiving, also update status to "Archived"
    if (archived) {
      form.status = "Archived";
      form.lastStatusUpdate = Date.now();
    } else {
      // If unarchiving and status is "Archived", reset to "In Progress"
      if (form.status === "Archived") {
        form.status = "In Progress";
        form.lastStatusUpdate = Date.now();
      }
    }

    await form.save();

    res.status(200).json({
      success: true,
      data: form,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


/**
 * @desc    Permanently delete intake form
 * @route   DELETE /api/v1/intake-forms/:id/permanent
 * @access  Private (Admin only)
 */
exports.permanentlyDeleteIntakeForm = async (req, res, next) => {
  try {
    // Only allow admin to permanently delete
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can permanently delete forms",
      });
    }

    const intakeForm = await IntakeForm.findById(req.params.id);

    if (!intakeForm) {
      return res.status(404).json({
        success: false,
        message: "Intake form not found",
      });
    }

    // Permanently delete the form
    await intakeForm.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: "Form permanently deleted",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk delete intake forms
 * @route   POST /api/v1/intake-forms/bulk-delete
 * @access  Private (Admin only)
 */
exports.bulkDeleteIntakeForms = async (req, res, next) => {
  try {
    // Only allow admin to bulk delete
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can bulk delete forms",
      });
    }

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of form IDs to delete",
      });
    }

    // Delete all forms with the provided IDs
    const result = await IntakeForm.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      count: result.deletedCount,
      message: `${result.deletedCount} forms permanently deleted`,
    });
  } catch (err) {
    next(err);
  }
};

// Then add these routes to your intakeForm.js routes file
