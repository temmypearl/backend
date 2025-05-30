import { userController } from "../users/user.controller";

import express from "express";
import { validateData } from "./../../middlewares/validation";
import { authValidation } from "./../users/user.validation";


const authUserRoute = express.Router();


authUserRoute.post("/signin", validateData(authValidation.registerSchema), userController.signin);
authUserRoute.post("/verify-account", validateData(authValidation.verifySchema), userController.verifyAccount);
authUserRoute.post("/login", validateData(authValidation.LoginSchema), userController.login);
authUserRoute.post("/resend-otp", validateData(authValidation.verifySchema), userController.resendOtp);


export { authUserRoute, };