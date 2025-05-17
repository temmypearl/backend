import reservations from "../reservation/reservation.controller";
import express from "express";
import {registerValidation} from "../reservation/reservation.validation";
import { validateData } from "../../middlewares";
import createOrder from '../payment/paypal.controller';

const hotelRoute = express.Router();

hotelRoute.post("/api/v1/register",reservations.Register);
hotelRoute.post("/api/v1/services/paypal", createOrder);


// authRoutes.post("/signin",validateData(authValidation.registerSchema),UserController.signin);
// authRoutes.post("/login", UserController.login);
// authRoutes.post("/verify-account", UserController.verifyAccount);
// authRoutes.post("/refresh-token", UserController.refreshToken);

export{ hotelRoute };