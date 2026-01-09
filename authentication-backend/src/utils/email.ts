import nodemailer from "nodemailer";

export const sendResetOtpEmail = async (
    email: string,
    otp: string
): Promise<void> => {
    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: process.env.ETHEREAL_USER!,
            pass: process.env.ETHEREAL_PASS!,
        }
    });
    await transporter.sendMail({
        from: `"Support" <${process.env.ETHEREAL_USER}>`,
        to: email,
        subject: "Reset Password",
        html: `
        <p> Your password reset OTP: </p>
        <h2>${otp}</h2>
        <p> Valid for 15 minutes</p>`
    });
};