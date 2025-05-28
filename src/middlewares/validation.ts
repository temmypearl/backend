import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { ApiError } from '../middlewares'; // adjust path if needed

export function validateData(
    schema: z.ZodObject<any, any> | z.ZodEffects<any>,
    targets: ('body' | 'query' | 'params')[] = ['body']
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            for (const target of targets) {
                if (req[target]) {
                    const validatedData = await schema.parseAsync(req[target]);
                    req[target] = validatedData;
                }
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Pass all validation errors to the error handler
                return next(
                    new ApiError(400, 'Validation failed', true, {
                        errors: error.errors.map((err) => ({
                            field: err.path.join('.'),
                            message: err.message,
                        })),
                    })
                );
            }

            // Let the error handler catch unexpected errors
            return next(error);
        }
    };
}
