import Joi from "joi";

export const createUserSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name must not exceed 50 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 128 characters",
    "any.required": "Password is required",
  }),
  role: Joi.string()
    .valid("admin", "analyst", "viewer")
    .messages({
      "any.only": "Role must be one of: admin, analyst, or viewer",
    })
    .optional(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .messages({
      "string.empty": "Name cannot be empty",
      "string.min": "Name must be at least 3 characters",
      "string.max": "Name must not exceed 50 characters",
    })
    .optional(),
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .messages({
      "string.email": "Please provide a valid email address",
    })
    .optional(),
  role: Joi.string()
    .valid("admin", "analyst", "viewer")
    .messages({
      "any.only": "Role must be one of: admin, analyst, or viewer",
    })
    .optional(),
  isActive: Joi.boolean()
    .messages({
      "boolean.base": "isActive must be a true or false",
    })
    .optional(),
  currentPassword: Joi.string()
    .messages({
      "any.required": "Current password is required when changing password",
    })
    .optional(),
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .messages({
      "string.min": "New password must be at least 6 characters",
      "string.max": "New password must not exceed 128 characters",
    })
    .optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

export const updateMyProfileSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .messages({
      "string.empty": "Name cannot be empty",
      "string.min": "Name must be at least 3 characters",
      "string.max": "Name must not exceed 50 characters",
    })
    .optional(),
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .messages({
      "string.email": "Please provide a valid email address",
    })
    .optional(),
  currentPassword: Joi.string()
    .when("newPassword", {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.required": "Current password is required when changing password",
    }),
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .messages({
      "string.min": "New password must be at least 6 characters",
      "string.max": "New password must not exceed 128 characters",
    })
    .optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });
