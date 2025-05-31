import { userController } from "../users/user.controller";


import express from "express";
import { validateData } from "./../../middlewares/validation";
import {roomController}  from "./../room/room.controller";
import { registerValidation } from "../reservation/reservation.validation";
import {reservatons} from "../reservation/reservation.controller";
import { paystackController } from "../payment/paystack.controller";

const roomRoutes = express.Router();
roomRoutes.get("/getRooms", roomController.getRooms);
roomRoutes.post("/reserveRoom",validateData(registerValidation.registerSchema), reservatons.Register);
roomRoutes.post("/payment/initiate-payment", paystackController.initializePay);
roomRoutes.get("/payment/verify", paystackController.verifyPayment);

export {roomRoutes}