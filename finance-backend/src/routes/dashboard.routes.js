import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  getDashboardSummary,
  getCategoryTotals,
  getTypeTotals,
  getMonthlyTrends,
  getRecentActivity,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

// All authenticated users can access dashboard insights (read-only)
router.get(
  "/summary",
  protect,
  authorizeRoles("admin", "analyst", "viewer"),
  getDashboardSummary,
);

router.get(
  "/categories",
  protect,
  authorizeRoles("admin", "analyst", "viewer"),
  getCategoryTotals,
);

router.get(
  "/types",
  protect,
  authorizeRoles("admin", "analyst", "viewer"),
  getTypeTotals,
);

router.get(
  "/trends",
  protect,
  authorizeRoles("admin", "analyst", "viewer"),
  getMonthlyTrends,
);

router.get(
  "/recent",
  protect,
  authorizeRoles("admin", "analyst", "viewer"),
  getRecentActivity,
);

export default router;
