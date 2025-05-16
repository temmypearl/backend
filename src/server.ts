import express, { Request, Response, NextFunction } from 'express';

import cors from 'cors';
import morgan from 'morgan';

import { errorHandler } from './middlewares';
import { logger } from './config';
import httpStatus from 'http-status';

import apiRouter from './modules/routes';


const app = express();


// app.use(
//     cors({
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: false, 
//     })
//     );



app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(morgan('combined'));


// app.use((req: Request, res: Response, next: NextFunction) => {
    //   logger.info(`${req.method} ${req.url} - Body: ${JSON.stringify(req.body)}`);
    //   next();
    // });
    

// app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));


// app.get('/', (req: Request, res: Response) => {
//   res.send('Hello, Welcome to the Navo-Cargo API!');
// });


app.use("/Nonso", apiRouter)
// app.use('/api/v1', apiRouter);


// app.all('*', (req: Request, res: Response) => {
//   res.status(httpStatus.NOT_FOUND).json({
//     success: false,
//     message: `Cant find ${req.originalUrl} on this server!`,
//   });
// });


app.use(errorHandler);

export default app;