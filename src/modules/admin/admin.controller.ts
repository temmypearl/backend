//check all paid reservations
//check all reservations
//check all refund requests
//signin
//login
//verifyaccount
//verfy otp
//view all available rooms
import { Request, Response } from "express";
import { Asyncly } from "../../extension";
import { eq, or } from "drizzle-orm";
import { db } from "../../drizzle/connection";
import { Reservation } from "../reservation/reservation.model";
import { refundTable } from "../payment/payment.model";
import { roomModel } from "../room/room.model";
import { ApiError } from "../../middlewares";
import { authValidation } from "../users/user.validation";
import { sendOTPEmail } from "../mail/email";
import { TokenService } from "../../utils/tokens";
import { AuthTokens } from "../../utils/hash";
import { ITokenPayload } from "../users/user.interface";
import { User } from "../users/user.model";
import { Admin } from "./admin.model";

const adminSignin = Asyncly(async (req: Request, res: Response) => {
    const data = authValidation.registerSchema.parse(req.body);

    const existingAdmin = await db.select().from(Admin).where(
        or(eq(Admin.email, data.email), eq(Admin.phoneNumber, data.phoneNumber))
    );

    if (existingAdmin[0]) {
        throw new ApiError(409, "Email or phone number already registered.");
    }

    const hashedPassword = await AuthTokens.hashPassword(data.password);

    const [admin] = await db
        .insert(Admin)
        .values({
            Name: data.firstName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            password: hashedPassword,
            role: "admin", // Important
        })
        .returning();

    const otpResult = await sendOTPEmail(data.email);
    if (!otpResult) throw new ApiError(500, "Unable to send OTP.");

    await db.update(Admin)
        .set({
            verificationCode: otpResult.otp,
            otpCreatedAt: new Date(),
            otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
        })
        .where(eq(Admin.id, admin.id));

    const { password, refreshToken, ...safeAdmin } = admin;
    res.status(201).json({
        message: "Admin created successfully. OTP sent to email.",
        admin: safeAdmin,
    });
});

const verifyAdminAccount = Asyncly(async (req: Request, res: Response) => {
    const data = authValidation.verifySchema.parse(req.body);

    const [admin] = await db
        .select()
        .from(Admin)
        .where(eq(Admin.verificationCode, data.verificationCode));

    if (!admin) throw new ApiError(404, "Invalid verification code.");
    if (admin.isVerified) throw new ApiError(409, "Admin already verified.");
    if (admin.otpExpiresAt < new Date()) throw new ApiError(409, "Verification code expired.");

    await db.update(Admin)
        .set({
            isVerified: true,
            verificationCode: null,
            otpCreatedAt: null,
            otpExpiresAt: null,
            otpRequestCount: admin.otpRequestCount + 1,
        })
        .where(eq(Admin.id, admin.id));

    const tokenPayload: ITokenPayload = {
        id: admin.id,
        email: admin.email,
        name: `${admin.Name}`,
        role: admin.role,
    };

    const accessToken = TokenService.generateAccessToken(tokenPayload);
    const refreshToken = TokenService.generateRefreshToken(tokenPayload);

    await db.update(Admin).set({ refreshToken }).where(eq(Admin.id, admin.id));

    res.status(200).json({
        message: "Admin verified successfully.",
        admin: {
            id: admin.id,
            email: admin.email,
            Name: admin.Name,
            phoneNumber: admin.phoneNumber,
        },
        token: { accessToken, refreshToken },
    });
});

const resendAdminOTP = Asyncly(async (req: Request, res: Response) => {
    const data = authValidation.resendVerficationCode.parse(req.body);

    const [admin] = await db.select().from(Admin).where(eq(Admin.email, data.email));

    if (!admin) throw new ApiError(404, "Admin not found.");
    if (admin.isVerified) throw new ApiError(409, "Admin already verified.");
    if (admin.otpExpiresAt > new Date()) throw new ApiError(409, "OTP already sent, wait until expiry.");
    if (admin.otpRequestCount >= 3) throw new ApiError(429, "OTP request limit exceeded.");

    const otpResult = await sendOTPEmail(admin.email);
    if (!otpResult) throw new ApiError(500, "Unable to resend OTP.");

    await db.update(Admin)
        .set({
            verificationCode: otpResult.otp,
            otpCreatedAt: new Date(),
            otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
            otpRequestCount: admin.otpRequestCount + 1,
        })
        .where(eq(Admin.id, admin.id));

    res.status(200).json({ message: "OTP resent successfully." });
});


const adminLogin = Asyncly(async (req: Request, res: Response) => {
    const data = authValidation.LoginSchema.parse(req.body);

    const [admin] = await db.select().from(Admin).where(eq(Admin.email, data.email));

    if (!admin) throw new ApiError(404, "Wrong email or password.");
    if (!admin.isVerified) throw new ApiError(409, "Admin not verified.");

    const isPasswordValid = await AuthTokens.comparePassword(data.password, admin.password);
    if (!isPasswordValid) throw new ApiError(401, "Wrong email or password.");

    const tokenPayload: ITokenPayload = {
        id: admin.id,
        email: admin.email,
        name: `${admin.Name}`,
        role: admin.role,
    };

    const accessToken = TokenService.generateAccessToken(tokenPayload);
    const refreshToken = TokenService.generateRefreshToken(tokenPayload);

    const { password, refreshToken: adminRefreshToken, ...safeAdmin } = admin;
    res.status(200).json({
        message: "Admin logged in successfully.",
        admin: safeAdmin,
        token: { accessToken, refreshToken },
    });
})
const getAllReservations = Asyncly(async (req: Request, res: Response) => {
    const reservations = await db.select().from(Reservation);
    res.status(200).json({ reservations });
});

const getAllPaidReservations = Asyncly(async (req: Request, res: Response) => {
    const reservations = await db.select().from(Reservation).where(eq(Reservation.paymentStatus, "paid"));
    res.status(200).json({ reservations });
});

const getAllRefundRequests = Asyncly(async (req: Request, res: Response) => {
    const refunds = await db.select().from(refundTable);
    res.status(200).json({ refunds });
});

const getAllAvailableRooms = Asyncly(async (req: Request, res: Response) => {
    const rooms = await db.select().from(roomModel);
    res.status(200).json({ rooms });
});

const adminController = {
    getAllReservations,
    getAllPaidReservations,
    getAllRefundRequests,
    getAllAvailableRooms,
    adminSignin,
    verifyAdminAccount,
    resendAdminOTP,
    adminLogin,
}
export default adminController
