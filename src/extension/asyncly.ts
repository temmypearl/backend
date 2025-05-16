import { NextFunction, Request, Response } from 'express';

export const Asyncly =
(fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('Async handler error:', error);

    });
};


