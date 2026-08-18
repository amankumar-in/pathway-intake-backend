const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  login,
  logout,
  getMe,
  getUsers,
  deleteUser,
  updatePassword,
  resetUserPassword,
  updateUserRole,
  getUserData,
  canDeleteUser,
} = require("../controllers/auth");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: "Too many login attempts, please try again after 15 minutes." }
});

// Public routes
router.post("/login", loginLimiter, login);
router.get("/logout", logout);

// Protected routes
router.get("/me", protect, getMe);
router.put("/updatepassword", protect, updatePassword);

// Admin only routes
router.post("/register", protect, authorize("admin"), register);
router.get("/users", protect, authorize("admin"), getUsers);
router.get("/users/:id/data", protect, authorize("admin"), getUserData);
router.get("/users/:id/can-delete", protect, authorize("admin"), canDeleteUser);
router.put("/users/:id/role", protect, authorize("admin"), updateUserRole);
router.put(
  "/users/:id/resetpassword",
  protect,
  authorize("admin"),
  resetUserPassword
);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
