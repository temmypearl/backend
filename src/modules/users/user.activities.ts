
// import { Request } from "express";
// import Jwt  from "jsonwebtoken";
// import dotenv from 'dotenv'
// import bcrypt from 'bcrypt';
// import { ApiError } from "middlewares";
// dotenv.config({path: './config.env'});
// import crypto from 'crypto';
// import db from "./../Servers/databaseServer"
// import { User } from "./user.model";
// import {Otp_Table} from "../DB_schemas/otpSchema";
// import {generateAccessToken, generateRefreshToken, verifyToken, getIpAddress} from "../../helpers/tokenServices";
// import { eq, and , gt} from 'drizzle-orm/expressions';

// interface TokenPayload {
//     userId: string;
// }
// class userActivityManager{
//     private payload: { name: string; email: string; password: string; phonenumber: string };
//     private accessToken: string;
//     private refreshToken: string;
//     private ipaddress: string
//     private randomString: string;

//     constructor(req: Request, payload: { name: string; email: string; password: string; phonenumber: string }) {
//         this.payload = payload;
//         this.randomString = crypto.randomBytes(16).toString("hex");
//         // this.ipaddress = payload.ipaddress;
//         this.ipaddress = getIpAddress(req); // Get the IP address
//         this.accessToken = generateAccessToken(this.payload.email);
//         this.refreshToken = generateRefreshToken(this.payload.email);
//     };
    

//     private static async hashPassword(password:string, saltRounds:number):Promise<string>{
//         return bcrypt.hash(password, saltRounds);
//     }

//     public async comparePassword(password:string, dbpassword:string):Promise<boolean>{
//         return await bcrypt.compare(password,dbpassword)
//     }

//     public async createotp():Promise<string>{
//         return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
//     }
    
//     createuser = async():Promise<any>=>{ 
//         try {
//                 const hashedPassword = await userActivityManager.hashPassword((this.payload as any).password, 12);

                

//                 const [newUser] = await db
//                     .insert(User)

//                     .values({
//                         name: this.payload.name,

//                         email: this.payload.email,

//                         password: hashedPassword,
                        
//                         phonenumber: this.payload.phonenumber,

//                         refresh_token: this.refreshToken,

//                         ip_address: this.ipaddress
//                     })
//                     .returning(); 
//                 const { password, ...userWithoutPassword } = newUser;
                
//                 return userWithoutPassword;

//             }catch (error: unknown) {
//                 this.handleError(error);
//                     }
//         }
    
// logUserIN = async()=>{
//         try {
//             const user = await db
            
//             .select()

//             .from(User)

//             .where(    
//                     eq(User, this.payload.email),
//                 ).limit(1)
                        
//                 if (user.length === 0) {
//                     throw new ApiError(404, 'Email Provided does not exist.', false); 
//                 }

//             const checkPassword = await this.comparePassword(this.payload.password, user[0].password)

//             const refreshtoken = user[0].refresh_token

//                 if(!checkPassword) throw new ApiError(404,'incorrect Password', false)
//                     const { password,refresh_token, ip_address, ...userWithoutPassword } = user[0];
    
    
//             return{ userWithoutPassword,refreshtoken}

//         } catch (error:unknown) {
//             this.handleError(error);
//         }
//     }

// //forgot password function
// forgotPassword = async (): Promise<{ token: string; expires: Date; message: string }> => {
//         try {
//             const { token, expires } = this.generateResetToken();

//             const encryptedToken = crypto.createHash('sha256').update(token).digest('hex');

//             const user = await db
//             .update(User)
//             .set({
//             passwordResetToken: encryptedToken,

//             Password_Reset_Tokencreated_at: new Date(),

//             passwordResetTokenExpires: expires,
// })
//     .where(eq(User, this.payload.email))
//     .returning();   
//             return { token, expires, message: 'Password reset token generated successfully.' };
//         } catch (error: unknown) {
            
//             console.error('Error in forgotPassword:', error);
//             this.handleError(error);
//         }
//     }
// //resendotp
// resendotp = async()=>{

//     try {

//         const user = await db
            
//             .select()

//             .from(User)

//             .where(    
//                     eq(User.email, this.payload.email),
//                 ).limit(1)
           
//             return user[0]
//     } catch (error) {
//         this.handleError(error)
//     }
// }
//     //send otp function
// sendotp = async(userid:string)=>{

//         const otp =await this.createotp();
//         try {
//             const hashedOTP = crypto.createHash('sha256').update( otp).digest('hex');

//             const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

//             const result = await db.insert(Otp_Table).values({
//                 user_id: userid,   

//                 otp_code: hashedOTP,

//                 expires_at: expiresAt,

//                 is_used: false,

//             }) .onConflictDoUpdate({
//                 target: Otp_Table.id,

//                 set: {
//                     otp_code: hashedOTP,

//                     expires_at: expiresAt,

//                     is_used: false,
//                 },
//               });;
//         if (!result) throw new Error('Unable to create OTP');
     
//         return { message: 'OTP created successfully', otp };

//         } catch (error) {
//             this.handleError(error);
//         }
//     }

// // verifytoken functionality
//     verifyotp = async(otp: string )=>{

//         const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
//         const now = new Date();
        
//         now.setMilliseconds(0);
//         try {
//             const result = await db
//             .select({
//                 id: User.id,

//                 username: User.lastName,

//                 email: User.email,

//                 expiresat: Otp_Table.expires_at,
//             })

//             .from(Otp_Table)

//             .innerJoin(User, eq(Otp_Table.user_id, User.id))

//             .where(

//             and(
//                 eq(Otp_Table.otp_code, hashedOTP),

//                 eq(Otp_Table.is_used, false),

//                 gt(Otp_Table.expires_at, now)
//             )
//             )
//             .limit(1);

//             if (result.length === 0) {
//                 throw new Error('Invalid or expired OTP');
//             }

//              // Update the OTP record, setting specific fields to NULL
//             await db
//             .update(Otp_Table)

//             .set({

//                 otp_code: "",

//                 is_used: true,
//             })
//             .where(eq(Otp_Table.user_id, result[0].id));

//             //find user thatsbeing verified
            
//             return result[0]

//                 } catch (error) {
//                     console.error('Error in verifying otp:', error);
//                     this.handleError(error);
//                 }
//     }
// //resettoken function
// resettoken= async()=>{
//     try {
//         const result = await db
//         .update(userTable)
//         .set({
//             passwordResetToken: null,

//             passwordResetTokenExpires: null,
//         })
//         .where(eq(userTable.email, this.payload.email));;

//      }catch (error) {
//             console.error('Error in forgotPassword:', error);

//             this.handleError(error);
//     }
// }

// //reset PAssword function
// resetPassword = async(token:string)=>{
// try{
//     const encryptedToken = crypto.createHash('sha256').update(token).digest('hex');

//     // Select the user with the matching password reset token
//     const user = await db
//         .select()

//         .from(userTable)

//         .where(eq(userTable.passwordResetToken, encryptedToken))

//         .then((result) => result[0]);
  
//     if (!user) {
//         throw new ApiError(404,'Invalid token', false);
//     }
  
//     const currentUtcDate = new Date();
//     const tokenExpiry = user.passwordResetTokenExpires;
  
//     if (tokenExpiry && currentUtcDate < tokenExpiry) {
//       const hashedPassword = await userActivityManager.hashPassword(this.payload.password, 12);
  
//       // Update the user's password
//       await db
//         .update(userTable)
//         .set({ password: hashedPassword })
//         .where(eq(userTable.id, user.id));
  
//       // Reset the password reset token and its expiry
//       await db
//         .update(userTable)

//         .set({

//           passwordResetToken: null,

//           passwordResetTokenExpires: null,

//         })

//         .where(eq(userTable.id, user.id));
  
//         return {name: user.name, Email: user.email}
//     } else {
//       this.resettoken();

//       throw new ApiError(500, 'Token has expired',false);
//     }
//         } catch (error) {
//             console.error('Error in forgotPassword:', error);
//             this.handleError(error);
//         }
//     }
    
//     getToken(): string {
        
//         return this.accessToken;
//     }

// //generate token function
//     private generateResetToken(): { token: string; expires: Date } {
//         const token = crypto.randomBytes(2).toString('hex');

//         const expires = new Date(Date.now() + 3600000); // Token valid for 1 hour

//         return { token, expires };
//     }

// //error handler function
//     private handleError(error: unknown): never {
//         const err = error instanceof Error

//             ? new ApiError(500,error.message, false)

//             : new ApiError(500, 'An unknown error occurred', false);

//         throw err;
//     }

    
//     }

//     export default userActivityManager;