import { type Request, type Response, type NextFunction } from 'express';
import { type Schema, ValidationError } from 'joi';

export interface ValidationLocation {
    body?: Schema;
    params?: Schema;
    query?: Schema;
}

declare global {
    namespace Express {
        interface Request {
            validatedBody?: any;
            validatedParams?: any;
            validatedQuery?: any;
        }
    }
}

export const joiValidationMiddleware = (schemas: ValidationLocation) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const errors: { [key: string]: any[] } = {};

        // Validate body
        if (schemas.body) {
            const { error, value } = schemas.body.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                errors.body = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    type: detail.type
                }));
            } else {
                req.body = value;
                req.validatedBody = value;
            }
        }

        // Validate params
        if (schemas.params) {
            const { error, value } = schemas.params.validate(req.params, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                errors.params = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    type: detail.type
                }));
            } else {
                req.params = value;
                req.validatedParams = value;
            }
        }

        // Validate query
        if (schemas.query) {
            const { error, value } = schemas.query.validate(req.query, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                errors.query = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    type: detail.type
                }));
            } else {
                req.query = value;
                req.validatedQuery = value;
            }
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors
            });
        }

        next();
    };
};
