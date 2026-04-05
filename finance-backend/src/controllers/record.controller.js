import Record from "../models/record.model.js";
import { NotFoundError } from "../utils/errors.js";

// Create Record (Admin)
export const createRecord = async (req, res, next) => {
  try {
    const record = await Record.create({
      ...req.body,
      userId: req.user.id,
    });

    res.status(201).json(record);
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

    const filter = {
      userId: req.user.id,
      isDeleted: false,
    };

    if (type) filter.type = type;
    if (category) filter.category = category;

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        const start = new Date(startDate);
        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({ message: "startDate must be a valid date" });
        }
        filter.date.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({ message: "endDate must be a valid date" });
        }
        filter.date.$lte = end;
      }
    }

    if (search) {
      filter.$or = [
        { category: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const records = await Record.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await Record.countDocuments(filter);

    res.json({
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      data: records,
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
      throw new NotFoundError("Record not found");
    }

    res.json(record);
  } catch (error) {
    next(error);
  }
};

// Update Record (Admin)
export const updateRecord = async (req, res, next) => {
  try {
    const record = await Record.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
        isDeleted: false,
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!record) {
      throw new NotFoundError("Record not found");
    }

    res.json(record);
  } catch (error) {
    next(error);
  }
};

// Delete Record (Soft delete)
export const deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
        isDeleted: false,
      },
      { isDeleted: true }
    );

    if (!record) {
      throw new NotFoundError("Record not found");
    }

    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    next(error);
  }
};