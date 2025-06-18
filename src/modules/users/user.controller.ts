import { authValidation } from "./user.validation"
import { User } from "./user.model"
import { Asyncly } from "../../extension"
import { eq, and, gt, or } from 'drizzle-orm';
import { ApiError } from "../../middlewares"
import {db} from "../../drizzle/db"
import { errorHandler } from "../../middlewares"
import { NextFunction, Request, Response } from "express"
import {AuthTokens} from "../../utils/hash"
import { sendOTPEmail } from "../mail/email";
import { TokenService } from "../../utils/tokens";
import {ITokenPayload} from "./user.interface"

const signin = Asyncly( async (req:Request, res:Response) => {
    const data = req.body

    // const existingUser = await db.select().from(User).where({email: data.email}).execute()
    const existingUser = await db.select().from(User).where(
        or(
            eq(User.email, data.email),
            eq(User.phoneNumber, data.phoneNumber)
        )
    )

    if(existingUser[0] || existingUser.length>0){
        throw new ApiError(400, 'Email or Phone Number Already Exists')
    }
    
    const hashPassword = await AuthTokens.hashPassword(data.password)

    const newUser = await db
                        .insert(User)
    
                        .values({
                            lastName: data.lastName,
    
                            firstName: data.firstName,
    
                            email: data.email,
    
                            password: hashPassword,
                            
                            phoneNumber: data.phoneNumber
    
                        })
                        .returning(); 
        const otpResult = await sendOTPEmail(data.email)
        
        if(!otpResult){
            throw new ApiError(400, 'Unable to send OTP')
        }
        
        await db
            .update(User)
            .set({
                verificationCode: otpResult.otp,
                otpCreatedAt: new Date(),
                otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
            })
            .where(eq(User.id, newUser[0].id));

            const { password, refreshToken, ...safepassUser}  = newUser[0]
            res.status(201).json({
                message: 'User created successfully',
                user: {
                    ...safepassUser
                },
            }) 
})

const verifyAccount = Asyncly( async (req:Request, res:Response) => {
    const data = authValidation.verifySchema.parse(req.body)  

    const user = await db.select().from(User).where(
            eq(User.verificationCode, data.verificationCode),
    )
    if(!user || user.length === 0){
        throw new ApiError(404, 'User not found')
    }
    if(user[0].isVerified){
        throw new ApiError(409, 'User already verified')
    }
    if(user[0].verificationCode !== data.verificationCode){
        throw new ApiError(409, 'Invalid verification code')
    }
    if(user[0].otpExpiresAt < new Date()){
        throw new ApiError(409, 'Verification code expired')
    }
    await db
        .update(User)
        .set({
            isVerified: true,
            verificationCode: null,
            otpCreatedAt: null,
            otpExpiresAt: null,
            otpRequestCount: user[0].otpRequestCount + 1
        })
        .where(eq(User.id, user[0].id));
        const tokenPayload: ITokenPayload = {
            id: user[0].id,
            email: user[0].email,
            name: `${user[0].firstName} ${user[0].lastName}`,
  };
        const accessToken = TokenService.generateAccessToken(tokenPayload);
        const refreshToken = TokenService.generateRefreshToken(tokenPayload);

        await db
        .update(User)
        .set({
            refreshToken: refreshToken,
        })
        .where(eq(User.id, user[0].id));

        res.status(200).json({
            message: 'User verified successfully',
            user: {
                id: user[0].id,
                email: user[0].email,
                firstName: user[0].firstName,
                lastName: user[0].lastName,
                phoneNumber: user[0].phoneNumber
            },
            token: {
                accessToken,
                refreshToken
            }
        })
})


const resendOtp = Asyncly( async (req:Request, res:Response) => {
    const data = authValidation.resendVerficationCode.parse(req.body)  

    const user = await db.select().from(User).where(
        eq(User.email, data.email),
    )
    if(!user){
        throw new ApiError(404, 'User not found')
    }
    if(user[0].isVerified){
        throw new ApiError(409, 'User already verified')
    }
    if(user[0].otpExpiresAt > new Date()){
        throw new ApiError(409, 'OTP already sent, please wait for it to expire')
    }
    if(user[0].otpRequestCount >= 3){
        throw new ApiError(409, 'OTP request limit exceeded')
    }

    const otpResult = await sendOTPEmail(user[0].email)
        
        if(!otpResult){
            throw new ApiError(500, 'Unable to send OTP')
        }
        
        await db
            .update(User)
            .set({
                verificationCode: otpResult.otp,
                otpCreatedAt: new Date(),
                otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
                otpRequestCount: user[0].otpRequestCount + 1
            })
            .where(eq(User.id, user[0].id));
            
            res.status(200).json({
                message: 'OTP resent successfully',
                        
            }) 
}
)



const login = Asyncly( async (req, res) => {
    const data = authValidation.LoginSchema.parse(req.body)
    
    const user = await db.select().from(User).where(
        eq(User.email, data.email)
    )
    if(!user[0]){
        throw new ApiError(409, 'wrong email or password')
    }
    if(!user[0].isVerified){
        throw new ApiError(409, 'User not verified')
    }
console.log(data.password, user[0].password)
    const confirmPassword = await AuthTokens.comparePassword(data.password, user[0].password)
    if (!confirmPassword){
        throw new ApiError(409, 'Wrong email or Password')
    }
    const tokenPayload: ITokenPayload = {
        id: user[0].id,
        email: user[0].email,
        name: `${user[0].firstName} ${user[0].lastName}`,
    }
    if(!user[0].refreshToken){
        const refreshToken = TokenService.generateRefreshToken(tokenPayload);
        await db
        .update(User)
        .set({
            refreshToken: refreshToken,
        })
        .where(eq(User.id, user[0].id));
    }
    const accessToken = TokenService.generateAccessToken(tokenPayload);
    
    res.status(200).json({
        message: 'User Login success',
            user: {
                id: user[0].id,
                email: user[0].email,
                firstName: user[0].firstName,
                lastName: user[0].lastName,
                phoneNumber: user[0].phoneNumber,
            },
            token: {
                accessToken,
                refreshToken: user[0].refreshToken
            }
    })
})

//to do later: send the access and refresh token using cookies
const resetPassword = Asyncly( async (req:Request, res:Response) => {
    const data = authValidation.resetpasswordRequest.parse(req.body)
    const user = await db.select().from(User).where(
        eq(User.email, data.email)
    )
    if(!user[0]){
        throw new ApiError(404, 'User not found')
    }
    if(!user[0].isVerified){
        throw new ApiError(409, 'User not verified')
    }

})

export const userController = {
    signin,
    login,
    verifyAccount,
    resendOtp,
    resetPassword
}
