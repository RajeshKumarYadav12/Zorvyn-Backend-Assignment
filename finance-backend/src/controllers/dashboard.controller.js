import mongoose from "mongoose";
import Record from "../models/record.model.js";

export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await Record.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let income = 0;
    let expense = 0;

    result.forEach((item) => {
      if (item._id === "income") income = item.total;
      else expense = item.total;
    });

    res.json({
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryTotals = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const data = await Record.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          category: "$_id",
          total: 1,
          _id: 0,
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getMonthlyTrends = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const data = await Record.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
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
          income: 1,
          expense: 1,
          _id: 0,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getRecentActivity = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const records = await Record.find({
      userId,
      isDeleted: false,
    })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      recent: records,
    });
  } catch (error) {
    next(error);
  }
};

