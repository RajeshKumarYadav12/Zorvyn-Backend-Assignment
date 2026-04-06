import express from "express";
import { validate } from "../middleware/validate.middleware.js";
import {
  createRecordSchema,
  updateRecordSchema,
} from "../validators/record.validator.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
  getRecordById,
} from "../controllers/record.controller.js";

const router = express.Router();

// All authenticated users can view records
router.get(
  "/",
  protect,
  authorizeRoles("admin", "analyst", "viewer"),
  getRecords,
);

router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "analyst", "viewer"),
  getRecordById,
);

// Admin and Analyst can create records
router.post(
  "/",
  protect,
  authorizeRoles("admin", "analyst"),
  validate(createRecordSchema),
  createRecord,
);

// Admin and Analyst can update records (their own or all for admin)
router.patch(
  "/:id",
  protect,
  authorizeRoles("admin", "analyst"),
  validate(updateRecordSchema),
  updateRecord,
);

// Admin and Analyst can delete records (their own or all for admin)
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "analyst"),
  deleteRecord,
);

export default router;
