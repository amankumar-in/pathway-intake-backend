const express = require("express");
const {
  register,
  login,
  getMe,
  getUsers,
  deleteUser,
} = require("../controllers/auth");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);

// Admin only routes
router.post("/register", protect, authorize("admin"), register);
router.get("/users", protect, authorize("admin"), getUsers);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
