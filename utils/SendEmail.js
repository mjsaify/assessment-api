import nodemailer from 'nodemailer';

export const SendEmail = async ({ to, subject, text }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: process.env.SMTP_SENDER,
        to,
        subject,
        text
    });
};