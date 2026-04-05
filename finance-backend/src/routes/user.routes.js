import express from "express";
import { validate } from "../middleware/validate.middleware.js";
import { createUserSchema, updateUserSchema } from "../validators/user.validator.js";

import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin only routes
router.post("/", protect, authorizeRoles("admin"), validate(createUserSchema),createUser);
router.get("/", protect, authorizeRoles("admin"), getUsers);
router.patch("/:id", protect, authorizeRoles("admin"),   validate(updateUserSchema),updateUser);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

export default router;