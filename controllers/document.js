const Document = require("../models/Document");
const IntakeForm = require("../models/IntakeForm");

// @desc    Generate documents from intake form
// @route   POST /api/v1/documents/generate/:intakeFormId
// @access  Private
// @desc    Generate documents from intake form
// @route   POST /api/v1/documents/generate/:intakeFormId
// @access  Private
exports.generateDocuments = async (req, res, next) => {
  try {
    const intakeForm = await IntakeForm.findById(req.params.intakeFormId);

    if (!intakeForm) {
      return res.status(404).json({
        success: false,
        message: "Intake form not found",
      });
    }

    // Check if documents already exist for this intake form
    const existingDocuments = await Document.find({
      intakeForm: req.params.intakeFormId,
    });

    // If documents exist, delete them first
    if (existingDocuments.length > 0) {
      console.log(
        `Deleting ${existingDocuments.length} existing documents before regeneration`
      );
      await Document.deleteMany({ intakeForm: req.params.intakeFormId });
    }

    // todo Add document to be generated below
    const documentTemplates = [
      {
        title: "Notice of Action",
        category: "Intake Paperwork",
        additionalCategories: ["In House Move"],
        template: "N.O.A.",
      },
      {
        title: "ID-Emergency Information",
        category: "Intake Paperwork",
        additionalCategories: ["Shelter Bed Documents"],
        template: "ID-Emergency Info",
      },
      {
        title: "Agency to Agency Agreement",
        category: "Intake Paperwork",
        additionalCategories: ["Shelter Bed Documents"],
        template: "Agency to Agency Agreement",
      },
      {
        title: "Agency to Foster Parent",
        category: "Shelter Bed Documents",
        additionalCategories: ["In House Move", "Intake Paperwork"],
        template: "Agency to Foster Parent",
      },
      {
        title: "Client Grievance Guidelines",
        category: "In House Move",
        additionalCategories: ["Shelter Bed Documents"],
        template: "Client Grievance Guidelines",
      },
      {
        title: "County Worker Grievance Guidelines",
        category: "Intake Paperwork",
        additionalCategories: ["Shelter Bed Documents"],
        template: "County Worker Grievance Guidelines",
      },
      {
        title: "CHDP Form",
        category: "Intake Paperwork",
        additionalCategories: [],
        template: "CHPD",
      },
      {
        title: "Consent For Medical Treatment",
        category: "In House Move",
        additionalCategories: ["Intake Paperwork", "Shelter Bed Documents"],
        template: "Medical Treatment",
      },
      {
        title: "PRN Authorization Letter",
        category: "Intake Paperwork",
        additionalCategories: [],
        template: "PRN Authorization Letter",
      },
      {
        title: "PRN Page 2",
        category: "Intake Paperwork",
        additionalCategories: [],
        template: "PRN Page 2",
      },
      {
        title: "Client Personal Rights",
        category: "Intake Paperwork",
        additionalCategories: ["Shelter Bed Documents"],
        template: "Client Personal Rights",
      },
      {
        title: "Confirmation of T.B. Test",
        category: "Intake Paperwork",
        additionalCategories: [],
        template: "Confirm TB Test",
      },
      {
        title: "Confirmation of Ambulatory Status",
        category: "Intake Paperwork",
        additionalCategories: [],
        template: "Confirm Ambulatory Status",
      },
      {
        title: "Record of Client Cash Resources",
        category: "Intake Paperwork",
        additionalCategories: ["In House Move"],
        template: "Record of Client Cash Resources",
      },
      {
        title: "Client Initial Care Plan",
        category: "Intake Paperwork",
        additionalCategories: ["Shelter Bed Documents", "In House Move"],
        template: "Client Initial Care Plan",
      },
      {
        title: "Client Disciplinary Policy & Procedures",
        category: "Shelter Bed Documents",
        additionalCategories: ["Intake Paperwork"],
        template: "Client Disciplinary P. & P.",
      },
      {
        title: "Client Discharge",
        category: "Shelter Bed Documents",
        additionalCategories: ["Intake Paperwork"],
        template: "Client Discharge",
      },
      {
        title: "Acknowledgement of Prior Information",
        category: "Shelter Bed Documents",
        additionalCategories: ["Intake Paperwork", "In House Move"],
        template: "Acknowledgement of Prior Info",
      },
      {
        title: "Home Placement Log",
        category: "In House Move",
        additionalCategories: ["Intake Paperwork"],
        template: "Home Placement Log",
      },
      {
        title: "Emergency Information Log",
        category: "Intake Paperwork",
        additionalCategories: ["Shelter Bed Documents", "In House Move"],
        template: "Emergency Information Log",
      },
      {
        title: "Monthly Medication Record",
        category: "Intake Paperwork",
        additionalCategories: [],
        template: "Monthly Medication Record",
      },
      {
        title: "Medication & Destruction Record",
        category: "Intake Paperwork",
        additionalCategories: [],
        template: "Medication & Destruction Record",
      },
      {
        title: "Dental Treatment Record",
        category: "Intake Paperwork",
        additionalCategories: [],
        template: "Dental Treatment Record",
      },
      {
        title: "Quarterly Clothing Allowance",
        category: "Intake Paperwork",
        additionalCategories: ["In House Move"],
        template: "CA Form",
      },
      {
        title: "Quarterly Spending Allowance",
        category: "Intake Paperwork",
        additionalCategories: ["In House Move"],
        template: "Spending Allowance",
      },
      {
        title:
          "Consent to Release Medical/Confidential Information Authorization",
        category: "Intake Paperwork",
        additionalCategories: ["Shelter Bed Documents"],
        template: "CRMCIA",
      },
      {
        title: "Placement Application",
        category: "Intake Paperwork",
        additionalCategories: ["Shelter Bed Documents"],
        template: "Placement Application",
      },
      {
        title: "Foster Parent Checklist",
        category: "Intake Paperwork",
        additionalCategories: [],
        template: "Checklist",
      },
    ];

    // Create documents from templates
    const documentPromises = documentTemplates.map((template) => {
      return Document.create({
        title: template.title,
        category: template.category,
        additionalCategories: template.additionalCategories || [], // Use additional categories
        formData: {
          // Base form data from intake form
          ...intakeForm.toObject(),
          // Add template-specific fields here in the future
          template: template.template,
        },
        intakeForm: intakeForm._id,
        createdBy: req.user.id,
      });
    });

    const documents = await Promise.all(documentPromises);

    res.status(201).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all documents for an intake form
// @route   GET /api/v1/documents/intake/:intakeFormId
// @access  Private
exports.getDocumentsByIntakeForm = async (req, res, next) => {
  try {
    const documents = await Document.find({
      intakeForm: req.params.intakeFormId,
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get documents by category (including additionalCategories)
// @route   GET /api/v1/documents/category/:category
// @access  Private
exports.getDocumentsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { intakeFormId } = req.query;

    // Base query
    let query = {
      $or: [{ category }, { additionalCategories: category }],
    };

    // Add intakeForm filter if provided
    if (intakeFormId) {
      query.intakeForm = intakeFormId;
    }

    const documents = await Document.find(query);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single document
// @route   GET /api/v1/documents/:id
// @access  Private
exports.getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id).populate({
      path: "intakeForm",
      select: "name caseNumber",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update document
// @route   PUT /api/v1/documents/:id
// @access  Private
exports.updateDocument = async (req, res, next) => {
  try {
    let document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Update the document with the new form data
    // We're only updating the formData field
    // Add updatedBy and updatedAt
    const updateData = {
      formData: req.body.formData,
      updatedBy: req.user.id,
      updatedAt: Date.now(),
    };

    document = await Document.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add/update signature on document
// @route   PUT /api/v1/documents/:id/signature
// @access  Private
exports.updateDocumentSignature = async (req, res, next) => {
  try {
    const { signatureType, signatureData, position } = req.body;

    console.log("Received signature request:", {
      signatureType,
      signatureDataLength: signatureData.length,
    });

    let document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Different approach to handle signatures
    // Convert to normal JS object if it's a Mongoose Map
    let signatureObj = {};
    if (document.signatures) {
      // If it's a Map, convert to object
      if (typeof document.signatures.get === "function") {
        for (let [key, value] of document.signatures.entries()) {
          signatureObj[key] = value;
        }
      } else {
        // It's already an object
        signatureObj = document.signatures;
      }
    }

    // Update the signatures object
    signatureObj[signatureType] = {
      signature: signatureData,
      position: position || { x: 0, y: 0 },
    };

    // Update the document with the modified signatures
    document = await Document.findByIdAndUpdate(
      req.params.id,
      {
        signatures: signatureObj,
        updatedBy: req.user.id,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (err) {
    console.error("Error updating document signature:", err);
    next(err);
  }
};

// @desc    Delete document signature
// @route   DELETE /api/v1/documents/:id/signature/:type
// @access  Private
exports.deleteDocumentSignature = async (req, res, next) => {
  try {
    const { type } = req.params;

    let document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Remove the signature if it exists
    if (document.signatures && document.signatures.has(type)) {
      document.signatures.delete(type);

      // Save the document
      document.updatedBy = req.user.id;
      document.updatedAt = Date.now();
      await document.save();
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a standalone document (without requiring an intake form)
// @route   POST /api/v1/documents/standalone
// @access  Private
exports.createStandaloneDocument = async (req, res, next) => {
  try {
    const {
      title,
      template,
      category,
      additionalCategories,
      createdFor,
      formData,
    } = req.body;

    // Validate required fields
    if (!title || !template || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide title, template, and category for the document",
      });
    }

    // Create document with standalone flag
    const document = await Document.create({
      title,
      category,
      additionalCategories: additionalCategories || [],
      standAlone: true,
      createdFor: createdFor || "",
      formData: {
        ...formData,
        template, // Ensure template is included in formData
      },
      intakeForm: null, // No intake form associated
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (err) {
    console.error("Error creating standalone document:", err);
    next(err);
  }
};

// @desc    Get all standalone documents
// @route   GET /api/v1/documents/standalone
// @access  Private
exports.getStandaloneDocuments = async (req, res, next) => {
  try {
    let query;

    // If user is not admin, only show their documents
    if (req.user.role !== "admin") {
      query = Document.find({
        createdBy: req.user.id,
        standAlone: true,
      });
    } else {
      query = Document.find({ standAlone: true });
    }

    // Add populate for user info
    query = query.populate({
      path: "createdBy",
      select: "name username",
    });

    const documents = await query;

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add signatures to a standalone document
// @route   POST /api/v1/documents/:id/standalone-signatures
// @access  Private
exports.addStandaloneSignatures = async (req, res, next) => {
  try {
    const { signatures } = req.body;

    if (!signatures || typeof signatures !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid signatures data",
      });
    }

    let document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Format signatures into the Map format used by the model
    const signatureObj = {};

    // Process each signature
    for (const [type, data] of Object.entries(signatures)) {
      signatureObj[type] = {
        signature: data,
        position: { x: 0, y: 0 },
      };
    }

    // Update the document with the signatures
    document = await Document.findByIdAndUpdate(
      req.params.id,
      {
        signatures: signatureObj,
        updatedBy: req.user.id,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (err) {
    console.error("Error adding signatures to document:", err);
    next(err);
  }
};

/**
 * @desc    Permanently delete document
 * @route   DELETE /api/v1/documents/:id/permanent
 * @access  Private
 */
exports.permanentlyDeleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check if it's a standalone document
    if (!document.standAlone) {
      // For non-standalone documents, only admin can delete
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message:
            "Only admins can permanently delete intake-related documents",
        });
      }
    } else {
      // For standalone documents, check if user is owner or admin
      if (
        document.createdBy.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this document",
        });
      }
    }

    // Permanently delete the document
    await document.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: "Document permanently deleted",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bulk delete documents
 * @route   POST /api/v1/documents/bulk-delete
 * @access  Private
 */
exports.bulkDeleteDocuments = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of document IDs to delete",
      });
    }

    // Get the documents to check permissions
    const documents = await Document.find({ _id: { $in: ids } });

    // Filter IDs based on permissions
    const allowedIds = documents
      .filter((doc) => {
        // Admin can delete any document
        if (req.user.role === "admin") return true;

        // Users can only delete their own standalone documents
        return doc.standAlone && doc.createdBy.toString() === req.user.id;
      })
      .map((doc) => doc._id);

    if (allowedIds.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete any of the selected documents",
      });
    }

    // Delete allowed documents
    const result = await Document.deleteMany({ _id: { $in: allowedIds } });

    res.status(200).json({
      success: true,
      count: result.deletedCount,
      message: `${result.deletedCount} documents permanently deleted`,
    });
  } catch (err) {
    next(err);
  }
};
