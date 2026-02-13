import Joi from 'joi';

export const fileUploadSchema = Joi.object({
    name: Joi.string()
        .required()
        .min(1)
        .max(255)
        .messages({
            'string.base': 'File name must be a string',
            'string.empty': 'File name cannot be empty',
            'string.max': 'File name cannot exceed 255 characters',
            'any.required': 'File name is required'
        }),
    extension: Joi.string()
        .required()
        .messages({
            'string.base': 'Extension must be a string',
            'any.required': 'Extension is required'
        }),
    mimeType: Joi.string()
        .required()
        .messages({
            'string.base': 'MIME type must be a string',
            'any.required': 'MIME type is required'
        }),
    size: Joi.number()
        .required()
        .positive()
        .messages({
            'number.base': 'Size must be a number',
            'number.positive': 'Size must be a positive number',
            'any.required': 'Size is required'
        }),
    path: Joi.string()
        .required()
        .messages({
            'string.base': 'Path must be a string',
            'any.required': 'Path is required'
        }),
    userId: Joi.number()
        .required()
        .positive()
        .messages({
            'number.base': 'User ID must be a number',
            'number.positive': 'User ID must be a positive number',
            'any.required': 'User ID is required'
        })
}).unknown(false);

export const getFilesSchema = Joi.object({
    page: Joi.number()
        .default(1)
        .positive()
        .messages({
            'number.base': 'Page must be a number',
            'number.positive': 'Page must be a positive number'
        }),
    list_size: Joi.number()
        .default(10)
        .positive()
        .messages({
            'number.base': 'List size must be a number',
            'number.positive': 'List size must be a positive number'
        })
}).unknown(false);

export const fileIdSchema = Joi.object({
    id: Joi.number()
        .required()
        .positive()
        .messages({
            'number.base': 'ID must be a number',
            'number.positive': 'ID must be a positive number',
            'any.required': 'ID is required'
        })
}).unknown(false);