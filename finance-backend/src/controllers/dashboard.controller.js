import mongoose from "mongoose";
import Record from "../models/record.model.js";
import { ValidationError } from "../utils/errors.js";

// Get Dashboard Summary (Income, Expense, Net Balance)
export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const match = {
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
    };

    // Date range filter
    if (startDate || endDate) {
      match.date = {};

      if (startDate) {
        const start = new Date(startDate);
        if (Number.isNaN(start.getTime())) {
          throw new ValidationError(
            "startDate must be a valid date (YYYY-MM-DD)",
          );
        }
        match.date.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        if (Number.isNaN(end.getTime())) {
          throw new ValidationError(
            "endDate must be a valid date (YYYY-MM-DD)",
          );
        }
        end.setHours(23, 59, 59, 999);
        match.date.$lte = end;
      }
    }

    const result = await Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    let income = 0;
    let incomeCount = 0;
    let expense = 0;
    let expenseCount = 0;

    result.forEach((item) => {
      if (item._id === "income") {
        income = item.total;
        incomeCount = item.count;
      } else {
        expense = item.total;
        expenseCount = item.count;
      }
    });

    res.status(200).json({
      status: "success",
      data: {
        totalIncome: income,
        incomeCount,
        totalExpense: expense,
        expenseCount,
        netBalance: income - expense,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Category-wise Totals
export const getCategoryTotals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, startDate, endDate } = req.query;

    const match = {
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
    };

    if (type) {
      if (!["income", "expense"].includes(type)) {
        throw new ValidationError("Type must be either 'income' or 'expense'");
      }
      match.type = type;
    }

    // Date range filter
    if (startDate || endDate) {
      match.date = {};

      if (startDate) {
        const start = new Date(startDate);
        if (Number.isNaN(start.getTime())) {
          throw new ValidationError(
            "startDate must be a valid date (YYYY-MM-DD)",
          );
        }
        match.date.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        if (Number.isNaN(end.getTime())) {
          throw new ValidationError(
            "endDate must be a valid date (YYYY-MM-DD)",
          );
        }
        end.setHours(23, 59, 59, 999);
        match.date.$lte = end;
      }
    }

    const data = await Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          type: { $first: "$type" },
        },
      },
      {
        $project: {
          category: "$_id",
          total: 1,
          count: 1,
          type: 1,
          _id: 0,
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        categories: data,
        totalCategories: data.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Type-wise Totals (Income vs Expense breakdown)
export const getTypeTotals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const match = {
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
    };

    // Date range filter
    if (startDate || endDate) {
      match.date = {};

      if (startDate) {
        const start = new Date(startDate);
        if (Number.isNaN(start.getTime())) {
          throw new ValidationError(
            "startDate must be a valid date (YYYY-MM-DD)",
          );
        }
        match.date.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        if (Number.isNaN(end.getTime())) {
          throw new ValidationError(
            "endDate must be a valid date (YYYY-MM-DD)",
          );
        }
        end.setHours(23, 59, 59, 999);
        match.date.$lte = end;
      }
    }

    const data = await Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          average: { $avg: "$amount" },
        },
      },
      {
        $project: {
          type: "$_id",
          total: 1,
          count: 1,
          average: { $round: ["$average", 2] },
          _id: 0,
        },
      },
      { $sort: { type: 1 } },
    ]);

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Get Monthly Trends
export const getMonthlyTrends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { months = 12 } = req.query;

    const monthsToFetch = Math.min(Math.max(1, Number(months)), 24);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsToFetch);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const data = await Record.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
          },
          income: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0],
            },
          },
        },
      },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          monthName: {
            $arrayElemAt: [
              [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
              { $subtract: ["$_id.month", 1] },
            ],
          },
          income: 1,
          expense: 1,
          netSavings: { $subtract: ["$income", "$expense"] },
          _id: 0,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        trends: data,
        months: monthsToFetch,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Recent Activity
export const getRecentActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const limitNumber = Math.max(1, Math.min(50, Number(limit)));

    const records = await Record.find({
      userId,
      isDeleted: false,
    })
      .sort({ date: -1, createdAt: -1 })
      .limit(limitNumber)
      .select("amount type category date notes createdAt");

    res.status(200).json({
      status: "success",
      data: {
        recent: records,
        count: records.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
