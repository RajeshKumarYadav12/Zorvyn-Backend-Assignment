import Record from "../models/record.model.js";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "../utils/errors.js";

// Create Record (Admin, Analyst)
export const createRecord = async (req, res, next) => {
  try {
    const record = await Record.create({
      ...req.body,
      userId: req.user.id,
    });

    res.status(201).json({
      status: "success",
      message: "Record created successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// Get Records (All roles with access)
export const getRecords = async (req, res, next) => {
  try {
    const {
      type,
      category,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    // Validate pagination parameters
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Math.min(100, Number(limit)));

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      throw new ValidationError("Page must be a positive integer");
    }

    if (
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      throw new ValidationError("Limit must be an integer between 1 and 100");
    }

    const filter = {
      userId: req.user.id,
      isDeleted: false,
    };

    // Type filter
    if (type) {
      if (!["income", "expense"].includes(type)) {
        throw new ValidationError("Type must be either 'income' or 'expense'");
      }
      filter.type = type;
    }

    // Category filter
    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        const start = new Date(startDate);
        if (Number.isNaN(start.getTime())) {
          throw new ValidationError(
            "startDate must be a valid date (YYYY-MM-DD)",
          );
        }
        filter.date.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        if (Number.isNaN(end.getTime())) {
          throw new ValidationError(
            "endDate must be a valid date (YYYY-MM-DD)",
          );
        }
        // Set to end of day
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }

      // Validate date range
      if (startDate && endDate && filter.date.$gte > filter.date.$lte) {
        throw new ValidationError("startDate cannot be after endDate");
      }
    }

    // Search filter
    if (search) {
      filter.$or = [
        { category: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (pageNumber - 1) * limitNumber;

    const records = await Record.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await Record.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: {
        records,
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

// Get Record by ID
export const getRecordById = async (req, res, next) => {
  try {
    const record = await Record.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isDeleted: false,
    });

    if (!record) {
      throw new NotFoundError(
        "Record not found. It may have been deleted or does not exist.",
      );
    }

    res.status(200).json({
      status: "success",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// Update Record (Admin, Analyst)
export const updateRecord = async (req, res, next) => {
  try {
    // Only allow updating specific fields
    const allowedFields = ["amount", "type", "category", "date", "notes"];
    const updateData = {};

    for (const field of allowedFields) {
      if (field in req.body) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError("No valid fields provided for update");
    }

    const record = await Record.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
        isDeleted: false,
      },
      updateData,
      { new: true, runValidators: true },
    );

    if (!record) {
      throw new NotFoundError(
        "Record not found. It may have been deleted or does not exist.",
      );
    }

    res.status(200).json({
      status: "success",
      message: "Record updated successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Record (Soft delete - Admin, Analyst)
export const deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
        isDeleted: false,
      },
      { isDeleted: true },
      { new: true },
    );

    if (!record) {
      throw new NotFoundError(
        "Record not found. It may have already been deleted.",
      );
    }

    res.status(200).json({
      status: "success",
      message: "Record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
