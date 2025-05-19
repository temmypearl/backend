    import nodemailer from 'nodemailer';
    import dotenv from 'dotenv';

    dotenv.config({ path: '../config.env' });

    // Define an interface for email options
    interface EmailOptions {
        to: string;
        subject: string;
        text?: string;
        html?: string;
    }


    // Create a transporter
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth: {
            user: process.env.EMAILUSERNAME,
            pass: process.env.EMAILPASSWORD,
        },
    });


    // Verify the connection configuration
    transporter.verify((error, success) => {
        if (error) {
            console.error('Error setting up transporter:', error);
            
        } else {
            console.log('Mail transporter configured successfully:', success);
        }
    });

    // Function to send emails
    export const sendEmail = async ({ to, subject, text, html }: EmailOptions): Promise<boolean> => {
        try {
            await transporter.sendMail({
                from: process.env.EMAILUSERNAME,
                to,
                subject,
                text,
                html,
            });
    
            console.log(`Email sent successfully to ${to}`);
            return true; // Indicate success
        } catch (error) {
            console.error(`Error sending email to ${to}:`, error);
            return false; // Indicate failure
        }
    };
    

    export default { sendEmail}

    //email functions