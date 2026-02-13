import Joi from 'joi';

export const signUpSchema = Joi.object({
    id: Joi.string()
        .required()
        .min(3)
        .max(255)
        .messages({
            'string.base': 'ID must be a string',
            'string.empty': 'ID cannot be empty',
            'string.min': 'ID must have at least 3 characters',
            'string.max': 'ID cannot exceed 255 characters',
            'any.required': 'ID is required'
        }),
    password: Joi.string()
        .required()
        .min(6)
        .max(255)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .messages({
            'string.base': 'Password must be a string',
            'string.empty': 'Password cannot be empty',
            'string.min': 'Password must have at least 6 characters',
            'string.max': 'Password cannot exceed 255 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'Password is required'
        })
}).unknown(false);

export const signInSchema = signUpSchema;

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string()
        .required()
        .messages({
            'string.base': 'Refresh token must be a string',
            'string.empty': 'Refresh token cannot be empty',
            'any.required': 'Refresh token is required'
        })
}).unknown(false);