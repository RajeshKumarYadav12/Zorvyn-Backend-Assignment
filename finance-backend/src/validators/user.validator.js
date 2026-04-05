import Joi from "joi";

export const createUserSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required().messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 3 characters',
    'string.max': 'Name must be less than 50 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.max': 'Password must be less than 128 characters',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid("admin", "analyst", "viewer").default("viewer").messages({
    'any.only': 'Role must be admin, analyst, or viewer'
  }),
});

export const updateUserSchema = Joi.object({
  role: Joi.string().valid("admin", "analyst", "viewer").messages({
    'any.only': 'Role must be admin, analyst, or viewer'
  }),
  isActive: Joi.boolean().messages({
    'boolean.base': 'isActive must be a boolean'
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});