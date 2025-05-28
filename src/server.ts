import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { errorHandler } from './middlewares';
import { logger } from './config';
import httpStatus from 'http-status';
import apiRouter from './modules/routes';



const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: false, // Disable credentials for CORS
}));


app.use(morgan('combined'))

app.use("/api/v1", apiRouter)

// app.all('*', (req: Request, res: Response) => {
//     res.status(httpStatus.NOT_FOUND).json({
//         success: false,
//         message: `Cant find ${req.originalUrl} on this server!`,
//     });
// });


app.use(errorHandler);

export default app;