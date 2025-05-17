import { Response, Request, NextFunction } from "express";
import {Asyncly} from "./../../extension/asyncly";
import {registerValidation} from "./reservation.validation";
import { ApiError } from "../../middlewares";
import { Reservation } from "./reservation.model";


const Register = Asyncly(async(req: Request, res: Response, next: NextFunction) => {
    const result = registerValidation.registerSchema.safeParse(req.body)
        if (!result.success) {
            const errorMap: Record<string, string> = {};

            result.error.issues.forEach((issue) => {
                const field = issue.path.join('.')

                if (!errorMap[field]) {
                errorMap[field] = issue.message;
                }
            });

            next(new ApiError(400, 'Validation Failed', false, errorMap));
            
            }

            try {
                const data = result.data;

                const registerUser = await Reservation.create({
                    
                })
            } catch (error) {
                
            }
})

const reservatons = {Register}

export default reservatons;