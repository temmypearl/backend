import express from "express";
import { validateData } from "../../middlewares/validation";
import adminController from "../admin/admin.controller";
import { requireAdmin, requireRole } from "../../middlewares/admin.auth.middleware";
import { authValidation } from "../users/user.validation";

const adminRouter = express.Router();

// ============ AUTH ROUTES ==============
adminRouter.post("/signup",validateData(authValidation.registerSchema),adminController.adminSignin);

adminRouter.post("/login",validateData(authValidation.LoginSchema, ["body"]),adminController.adminLogin);

adminRouter.post("/verify-account",validateData(authValidation.verifySchema, ["body"]),adminController.verifyAdminAccount);

adminRouter.post("/resend-otp",validateData(authValidation.resendVerficationCode, ["body"]),adminController.resendAdminOTP);

// ============ PROTECTED ADMIN ROUTES (require admin token + role check) ==============
// adminRouter.use(requireAdmin); //Protect all routes below

adminRouter.get("/reservations", adminController.getAllReservations);
adminRouter.get("/reservations/paid", adminController.getAllPaidReservations);
adminRouter.get("/refunds", adminController.getAllRefundRequests);
adminRouter.get("/rooms", adminController.getAllAvailableRooms);

// ============ EXAMPLE FLEXIBLE ROLES ==============
// If you later want routes accessible by ["admin", "superadmin"], do this:
// adminRouter.get("/special", requireRole(["superadmin"]), adminController.specialStuff);

export { adminRouter };
