const express = require("express");
const {
  register,
  login,
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

// Public routes
router.post("/login", login);

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
