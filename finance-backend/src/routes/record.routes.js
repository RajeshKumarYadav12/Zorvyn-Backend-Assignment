import express from "express";
import { validate } from "../middleware/validate.middleware.js";
import { createRecordSchema, updateRecordSchema } from "../validators/record.validator.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
  getRecordById
} from "../controllers/record.controller.js";

const router = express.Router();

// Admin only - create
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  validate(createRecordSchema),
  createRecord
);
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "analyst", "viewer"),
  getRecordById
);

// Admin only - update
router.patch(
  "/:id",
  protect,
  authorizeRoles("admin"),
  validate(updateRecordSchema),
  updateRecord
);

// Admin only - delete
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteRecord
);

// Admin + Analyst + Viewer - read
router.get(
  "/",
  protect,
  authorizeRoles("admin", "analyst", "viewer"),
  getRecords
);

export default router;