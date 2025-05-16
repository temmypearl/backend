import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';




export function validateData(
    schema: z.ZodObject<any, any> | z.ZodEffects<any>,
    targets: ('body' | 'query' | 'params')[] = ['body'],
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            targets.forEach((target) => {
                if (target in req) {
                    const validatedData = schema.parse(req[target]);
                    req[target] = validatedData;
                }
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
            
                const firstError = error.errors[0];
                res.status(422).json({
                    field: firstError.path.join('.'),
                    message: firstError.message,
                });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    };
}