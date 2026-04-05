import express from "express";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  getDashboardSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getRecentActivity,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

// Viewer, Analyst, Admin can access dashboard insights
router.get(
  "/summary",
  protect,
  authorizeRoles("admin", "analyst", "viewer"),
  getDashboardSummary
);

router.get(
  "/categories",
  protect,
  authorizeRoles("admin", "analyst", "viewer"),
  getCategoryTotals
);

router.get(
  "/trends",
  protect,
  authorizeRoles("admin", "analyst", "viewer"),
  getMonthlyTrends
);

router.get(
  "/recent",
  protect,
  authorizeRoles("admin", "analyst", "viewer"),
  getRecentActivity
);

export default router;