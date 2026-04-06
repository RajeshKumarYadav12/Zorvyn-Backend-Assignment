import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public Routes
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

// Protected Routes (to verify token)
router.get("/verify", protect, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Token is valid",
    user: req.user,
  });
});

export default router;
