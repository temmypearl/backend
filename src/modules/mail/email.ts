import nodemailer from 'nodemailer';

// === ENV CONFIG (replace with your real values or use dotenv/config file) ===
const EMAILUSERNAME = process.env.EMAILUSERNAME;
const EMAILPASSWORD = process.env.EMAILPASSWORD;

// Interface for email options
interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAILUSERNAME,
        pass: EMAILPASSWORD,
    },
});

// Verify transporter config
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Transporter error:', error);
    } else {
       
    }
});

// Function to send an email
const sendEmail = async ({ to, subject, text, html }: EmailOptions): Promise<boolean> => {
    try {
        await transporter.sendMail({
            from: EMAILUSERNAME,
            to,
            subject,
            text,
            html,
        });

       
        return true;
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error);
        return false;
    }
};

// Function to generate 6-digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to generate HTML OTP email template
const generateOTPTemplate = (otp: string, username?: string): string => {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Welcome${username ? ', ' + username : ''}!</h2>
        <p>Use the OTP below to verify your account:</p>
        <h1 style="background: #f2f2f2; padding: 10px 20px; width: fit-content; border-radius: 5px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
        <br/>
        <p>Thanks,<br/>Your Team</p>
    </div>
  `;
};

// Main function to send OTP email
export const sendOTPEmail = async (
    email: string,
    username?: string
): Promise<{ success: boolean; otp?: string }> => {
    const otp = generateOTP();
    const html = generateOTPTemplate(otp, username);

    const success = await sendEmail({
        to: email,
        subject: 'Your OTP Code',
        html,
    });

    return { success, otp: success ? otp : undefined };
};

