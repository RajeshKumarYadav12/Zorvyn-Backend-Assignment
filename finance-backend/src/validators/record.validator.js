import Joi from "joi";

export const createRecordSchema = Joi.object({
  amount: Joi.number().positive().required().precision(2).messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be a positive number",
    "any.required": "Amount is required",
  }),
  type: Joi.string().valid("income", "expense").required().messages({
    "any.only": 'Type must be either "income" or "expense"',
    "any.required": "Type is required",
  }),
  category: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Category cannot be empty",
    "string.min": "Category must be at least 2 characters",
    "string.max": "Category must not exceed 50 characters",
    "any.required": "Category is required",
  }),
  date: Joi.date()
    .max("now")
    .messages({
      "date.base": "Date must be a valid date",
      "date.max": "Date cannot be in the future",
    })
    .optional(),
  notes: Joi.string()
    .trim()
    .max(500)
    .allow("")
    .messages({
      "string.max": "Notes must not exceed 500 characters",
    })
    .optional(),
});

export const updateRecordSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .messages({
      "number.base": "Amount must be a number",
      "number.positive": "Amount must be a positive number",
    })
    .optional(),
  type: Joi.string()
    .valid("income", "expense")
    .messages({
      "any.only": 'Type must be either "income" or "expense"',
    })
    .optional(),
  category: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .messages({
      "string.min": "Category must be at least 2 characters",
      "string.max": "Category must not exceed 50 characters",
    })
    .optional(),
  date: Joi.date()
    .max("now")
    .messages({
      "date.base": "Date must be a valid date",
      "date.max": "Date cannot be in the future",
    })
    .optional(),
  notes: Joi.string()
    .trim()
    .max(500)
    .allow("")
    .messages({
      "string.max": "Notes must not exceed 500 characters",
    })
    .optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });
