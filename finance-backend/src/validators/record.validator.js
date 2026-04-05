import Joi from "joi";

export const createRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required'
  }),
  type: Joi.string().valid("income", "expense").required().messages({
    'any.only': 'Type must be either income or expense',
    'any.required': 'Type is required'
  }),
  category: Joi.string().trim().min(1).max(50).required().messages({
    'string.empty': 'Category cannot be empty',
    'string.max': 'Category must be less than 50 characters'
  }),
  date: Joi.date().default(Date.now).messages({
    'date.base': 'Date must be a valid date'
  }),
  notes: Joi.string().trim().max(200).allow("").messages({
    'string.max': 'Notes must be less than 200 characters'
  }),
});

export const updateRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2).messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be positive'
  }),
  type: Joi.string().valid("income", "expense").messages({
    'any.only': 'Type must be either income or expense'
  }),
  category: Joi.string().trim().min(1).max(50).messages({
    'string.empty': 'Category cannot be empty',
    'string.max': 'Category must be less than 50 characters'
  }),
  date: Joi.date().messages({
    'date.base': 'Date must be a valid date'
  }),
  notes: Joi.string().trim().max(200).allow("").messages({
    'string.max': 'Notes must be less than 200 characters'
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});