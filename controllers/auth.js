const User = require("../models/User");

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Private/Admin
exports.register = async (req, res, next) => {
  try {
    const { username, password, name, role } = req.body;

    // Create user
    const user = await User.create({
      username,
      password,
      name,
      role,
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User with this username already exists",
      });
    }
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate username & password
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide a username and password",
      });
    }

    // Check for user
    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users
// @route   GET /api/v1/auth/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map((user) => ({
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update password (user changes their own password)
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Get user with password field
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset user password (admin resets another user's password)
// @route   PUT /api/v1/auth/users/:id/resetpassword
// @access  Private/Admin
exports.resetUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    // Validate input
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide a new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role (admin updates user role)
// @route   PUT /api/v1/auth/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    // Validate role
    const validRoles = ["admin", "socialworker", "counsellor", "hr"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid role",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent changing admin user's role
    if (user.username === "admin" && role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot change admin user's role",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's forms and documents count
// @route   GET /api/v1/auth/users/:id/data
// @access  Private/Admin
exports.getUserData = async (req, res, next) => {
  try {
    const IntakeForm = require("../models/IntakeForm");
    const Document = require("../models/Document");

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get counts of forms and documents
    const intakeFormsCount = await IntakeForm.countDocuments({
      createdBy: req.params.id,
    });
    const documentsCount = await Document.countDocuments({
      createdBy: req.params.id,
    });

    // Get actual forms (limited to recent ones for display)
    const intakeForms = await IntakeForm.find({ createdBy: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("name caseNumber status createdAt archived");

    const documents = await Document.find({ createdBy: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("title category standAlone createdAt");

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
        counts: {
          intakeForms: intakeFormsCount,
          documents: documentsCount,
        },
        intakeForms,
        documents,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check if user can be deleted
// @route   GET /api/v1/auth/users/:id/can-delete
// @access  Private/Admin
exports.canDeleteUser = async (req, res, next) => {
  try {
    const IntakeForm = require("../models/IntakeForm");
    const Document = require("../models/Document");

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deletion of admin user
    if (user.username === "admin") {
      return res.status(400).json({
        success: false,
        canDelete: false,
        message: "Cannot delete admin user",
      });
    }

    // Check for associated data
    const intakeFormsCount = await IntakeForm.countDocuments({
      createdBy: req.params.id,
    });
    const documentsCount = await Document.countDocuments({
      createdBy: req.params.id,
    });

    const hasData = intakeFormsCount > 0 || documentsCount > 0;

    res.status(200).json({
      success: true,
      canDelete: true,
      requiresReassignment: hasData,
      data: {
        intakeFormsCount,
        documentsCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user and reassign data
// @route   DELETE /api/v1/auth/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const { reassignToUserId } = req.body;
    const IntakeForm = require("../models/IntakeForm");
    const Document = require("../models/Document");

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deletion of admin user
    if (user.username === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin user",
      });
    }

    // Check if user has associated data
    const intakeFormsCount = await IntakeForm.countDocuments({
      createdBy: req.params.id,
    });
    const documentsCount = await Document.countDocuments({
      createdBy: req.params.id,
    });

    const hasData = intakeFormsCount > 0 || documentsCount > 0;

    // If user has data, reassignment is required
    if (hasData) {
      if (!reassignToUserId) {
        return res.status(400).json({
          success: false,
          message: "User has associated data. Please provide reassignToUserId",
          requiresReassignment: true,
          data: {
            intakeFormsCount,
            documentsCount,
          },
        });
      }

      // Verify reassign target user exists
      const targetUser = await User.findById(reassignToUserId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "Target user for reassignment not found",
        });
      }

      // Reassign intake forms
      await IntakeForm.updateMany(
        { createdBy: req.params.id },
        { $set: { createdBy: reassignToUserId } }
      );

      // Reassign documents
      await Document.updateMany(
        { createdBy: req.params.id },
        { $set: { createdBy: reassignToUserId } }
      );
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: hasData
        ? `User deleted and ${intakeFormsCount} forms and ${documentsCount} documents reassigned`
        : "User deleted successfully",
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
