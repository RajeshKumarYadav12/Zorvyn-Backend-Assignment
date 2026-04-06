import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import { ValidationError, UnauthorizedError } from "../utils/errors.js";

// Register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      throw new ValidationError("Name, email, and password are required");
    }

    if (password !== confirmPassword) {
      throw new ValidationError("Passwords do not match");
    }

    if (password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters");
    }

    // Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ValidationError("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role (default to 'viewer' if not provided)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "viewer", // Use provided role or default to viewer
      isActive: true,
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Your account has been deactivated");
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
