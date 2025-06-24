import envRuntime from "@/config/env-runtime";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: envRuntime.SMTP_HOST,
    port: Number(envRuntime.SMTP_PORT),
    secure: Number(envRuntime.SMTP_PORT) === 465,
    auth: {
        user: envRuntime.SMTP_USER,
        pass: envRuntime.SMTP_PASS,
    },
});

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
}

export async function sendEmail(options: EmailOptions) {
    try {
        const info = await transporter.sendMail({
            from: envRuntime.EMAIL_FROM,
            ...options,
        });

        console.log("✅ Message sent: %s", info.messageId);
        console.log("✉️ Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        throw new Error("Failed to send email.");
    }
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    await sendEmail({
        to: email,
        subject: "Password Reset Request for E-Library",
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nThis link will expire in one hour.\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
        html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in one hour.</p>`,
    });
}