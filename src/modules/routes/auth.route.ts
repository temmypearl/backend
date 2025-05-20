import reservations from "../reservation/reservation.controller";
import userController from "./../users/user.contoller";
import express from "express";
import {registerValidation} from "../reservation/reservation.validation";
import { validateData } from "../../middlewares";
import createOrder from '../payment/paypal.controller';
import {initializePay} from '../payment/paystack.controller';

const hotelRoute = express.Router();

hotelRoute.post("/api/v1/login",userController.signin);
hotelRoute.post("/api/v1/register",reservations.Register);


hotelRoute.post("/api/v1/services/paypal", createOrder);
hotelRoute.post("/api/v1/services/paystack", initializePay);


// authRoutes.post("/signin",validateData(authValidation.registerSchema),UserController.signin);
// authRoutes.post("/login", UserController.login);
// authRoutes.post("/verify-account", UserController.verifyAccount);
// authRoutes.post("/refresh-token", UserController.refreshToken);

export{ hotelRoute };