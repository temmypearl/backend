import { UserController } from "../users/user.contoller";
import express from "express";
import { authValidation } from "../users/user.validation";
import { validateData } from "../../middlewares";

const authRoutes = express.Router();

// authRoutes.post("/signin",validateData(authValidation.registerSchema),UserController.signin);
// authRoutes.post("/login", UserController.login);
// authRoutes.post("/verify-account", UserController.verifyAccount);
// authRoutes.post("/refresh-token", UserController.refreshToken);

export{ authRoutes };