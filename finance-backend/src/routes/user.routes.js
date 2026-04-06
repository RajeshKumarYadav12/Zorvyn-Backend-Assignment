import express from "express";
import { validate } from "../middleware/validate.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  updateMyProfileSchema,
} from "../validators/user.validator.js";

import {
  createUser,
  getUsers,
  getUserById,
  getMyProfile,
  updateUser,
  updateMyProfile,
  deleteUser,
  reactivateUser,
} from "../controllers/user.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected Routes (All authenticated users)
router.get("/profile", protect, getMyProfile);
router.patch(
  "/profile",
  protect,
  validate(updateMyProfileSchema),
  updateMyProfile,
);

// Admin only - User Management Routes
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  validate(createUserSchema),
  createUser,
);
router.get("/", protect, authorizeRoles("admin"), getUsers);
router.get("/:id", protect, getUserById);
router.patch(
  "/:id",
  protect,
  authorizeRoles("admin"),
  validate(updateUserSchema),
  updateUser,
);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);
router.patch(
  "/:id/reactivate",
  protect,
  authorizeRoles("admin"),
  reactivateUser,
);

export default router;
