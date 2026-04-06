import User from "../models/user.model.js";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "../utils/errors.js";
import bcrypt from "bcryptjs";

// Create User (Admin only)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      throw new ValidationError("Name, email, and password are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ValidationError("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "viewer",
      isActive: true,
    });

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get All Users (Admin only)
export const getUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Math.min(100, Number(limit)));

    const filter = {};

    if (role) {
      if (!["viewer", "analyst", "admin"].includes(role)) {
        throw new ValidationError(
          "Role must be one of: viewer, analyst, or admin",
        );
      }
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true" || isActive === true;
    }

    const skip = (pageNumber - 1) * limitNumber;

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: {
        users,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil(total / limitNumber),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get User by ID (Admin can view any, Users can view their own)
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    // Check authorization
    if (requestingUser.role !== "admin" && requestingUser.id !== id) {
      throw new ForbiddenError("You can only view your own profile");
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Get My Profile
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Update User (Admin only - can update role and status, User can update name and password)
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, currentPassword, newPassword } =
      req.body;

    const user = await User.findById(id).select("+password");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // If updating another user's role/status, must be admin
    if (req.user.id !== id && req.user.role !== "admin") {
      throw new ForbiddenError("Only admins can update other users");
    }

    // If user is updating themselves
    if (req.user.id === id) {
      // Can update name
      if (name && name.trim().length >= 3) {
        user.name = name.trim();
      }

      // Password change requires current password
      if (newPassword) {
        if (!currentPassword) {
          throw new ValidationError(
            "Current password is required to set a new password",
          );
        }

        const isPasswordValid = await bcrypt.compare(
          currentPassword,
          user.password,
        );
        if (!isPasswordValid) {
          throw new ValidationError("Current password is incorrect");
        }

        if (newPassword.length < 6) {
          throw new ValidationError(
            "New password must be at least 6 characters",
          );
        }

        user.password = await bcrypt.hash(newPassword, 10);
      }
    } else if (req.user.role === "admin") {
      // Admin can update all fields
      if (name && name.trim().length >= 3) {
        user.name = name.trim();
      }

      if (email && email.toLowerCase() !== user.email) {
        const existingEmail = await User.findOne({
          email: email.toLowerCase(),
        });
        if (existingEmail) {
          throw new ValidationError("Email is already in use");
        }
        user.email = email.toLowerCase();
      }

      if (role && ["viewer", "analyst", "admin"].includes(role)) {
        user.role = role;
      }

      if (isActive !== undefined) {
        user.isActive = isActive;
      }
    }

    await user.save({ validateBeforeSave: true });

    const updatedUser = await User.findById(id).select("-password");

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Update My Profile (Users can update their own name and password)
export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updateData = {};

    if (name && name.trim().length >= 3) {
      updateData.name = name.trim();
      user.name = name.trim();
    }

    if (email && email.toLowerCase() !== user.email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        throw new ValidationError("Email is already in use");
      }
      updateData.email = email.toLowerCase();
      user.email = email.toLowerCase();
    }

    if (newPassword) {
      if (!currentPassword) {
        throw new ValidationError(
          "Current password is required to set a new password",
        );
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new ValidationError("Current password is incorrect");
      }

      if (newPassword.length < 6) {
        throw new ValidationError("New password must be at least 6 characters");
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save({ validateBeforeSave: true });

    const updatedUser = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Delete User (Admin can delete any user, but soft delete by marking inactive)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        throw new ValidationError("Cannot delete the last admin user");
      }
    }

    // Soft delete by marking as inactive
    user.isActive = false;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Reactivate User (Admin only)
export const reactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "User reactivated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
