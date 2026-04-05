import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
const router = express.Router();

// Auth Routes
router.post("/register", registerUser);
router.post("/login",validate(loginSchema), loginUser);

export default router;