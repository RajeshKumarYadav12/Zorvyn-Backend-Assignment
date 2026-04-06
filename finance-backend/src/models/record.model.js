import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
      validate: {
        validator: function (value) {
          return !isNaN(value) && value > 0;
        },
        message: "Amount must be a valid positive number",
      },
    },

    type: {
      type: String,
      enum: {
        values: ["income", "expense"],
        message: "Type must be either income or expense",
      },
      required: [true, "Transaction type is required"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      minlength: [2, "Category must be at least 2 characters"],
      maxlength: [50, "Category must not exceed 50 characters"],
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
      default: () => new Date(),
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: "Date cannot be in the future",
      },
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes must not exceed 500 characters"],
      default: "",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true, // Index for soft delete filtering
    },
  },
  { timestamps: true },
);

// Compound index for efficient queries
recordSchema.index({ userId: 1, isDeleted: 1, date: -1 });
recordSchema.index({ userId: 1, type: 1 });
recordSchema.index({ userId: 1, category: 1 });

export default mongoose.model("Record", recordSchema);
