import { userController } from "../users/user.controller";


import express, { Request, Response } from "express";
import { validateData } from "./../../middlewares/validation";
import { roomController } from "./../room/room.controller";
import { registerValidation } from "../reservation/reservation.validation";
import { reservatons } from "../reservation/reservation.controller";
import { paystackController } from "../payment/paystack.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/admin.auth.middleware";
import { createRoomSchema, editRoomSchema, deleteRoomSchema } from "../room/room.validation";
import { flutterwaveFunctions } from "../payment/flutterwave.controller";



const reservationRoutes = express.Router();
const roomRoutes = express.Router();
const paymentRoutes = express.Router();

// All routes require authentication
roomRoutes.get("/getRooms", requireAuth, requireAdmin, roomController.getRooms);

roomRoutes.post("/create", requireAuth, validateData(createRoomSchema), roomController.createRoom);

roomRoutes.patch("/:roomNo/editRoom", requireAuth, validateData(editRoomSchema), roomController.editRoom);

roomRoutes.delete("/:roomNo/deleteRoom", requireAuth, validateData(deleteRoomSchema), roomController.deleteRoom);

// roomRoutes.post("/reserveRoom", requireAuth, validateData(registerValidation.registerSchema), reservatons.Register);
roomRoutes.post("/payment/initiate-payment", requireAuth, paystackController.initializePay);
roomRoutes.get("/payment/verify", requireAuth, paystackController.verifyPayment);

// all reservation routes
reservationRoutes.post("/", requireAuth, validateData(registerValidation.registerSchema), reservatons.Register);
reservationRoutes.get("/history", requireAuth, reservatons.getReservationHistory);
reservationRoutes.get("/:id", requireAuth, reservatons.getReservationById);
reservationRoutes.patch("/:id/cancel", requireAuth, reservatons.cancelReservation);
reservationRoutes.patch("/:id/modify", requireAuth, reservatons.modifyReservation);
reservationRoutes.post("/multiple-booking", requireAuth, reservatons.multipleBooking);


paymentRoutes.post("/initiate-payment", requireAuth, paystackController.initializePay);
paymentRoutes.get("/verify", paystackController.verifyPayment);
paymentRoutes.post("/request-refund/:reservationId", requireAuth, paystackController.requestRefund);
// paymentRoutes.post("/refund/:refundRequestId", requireAdmin, paystackController.approveRefund);
paymentRoutes.get("/invoice/:reservationId", requireAuth, paystackController.getInvoice);
paymentRoutes.get("/methods", paystackController.getPaymentMethods);
paymentRoutes.post("/flutter_payment", flutterwaveFunctions.initializeFlutterwavePayment);
paymentRoutes.get("/flutter/verify", flutterwaveFunctions.verifyFlutterwavePayment);

// resv_395f9926-cb19-410b-9678-4d2d717523a1_1750279889696
// paymentRoutes.post("/request-refund/:reservationId", requireAuth, requestRefund);
// paymentRoutes.post("/refund/:refundRequestId", requireAdmin, approveRefund);
export { roomRoutes, reservationRoutes , paymentRoutes};


// GET     /users/profile
// PATCH   /users/profile/update
// POST    /users/reviews
// GET     /users/reviews/:roomId
// GET     /users/dashboard
// POST    /payment/refund/:reservationId
// GET     /payment/invoice/:reservationId
// GET     /payment/methods
// GET     /admin/dashboard
// GET     /admin/reports/occupancy
// GET     /admin/reports/revenue
// GET     /admin/users
// GET     /admin/staff
// POST    /admin/staff
// PATCH   /admin/staff/:staffId
// DELETE  /admin/staff/:staffId


