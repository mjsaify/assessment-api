import nodemailer from 'nodemailer';

export const SendEmail = async ({ to, subject, text }) => {
    const transporter = nodemailer.createTransport({
        service: process.env.G_SMTP_SERVICE,
        host: process.env.G_SMTP_HOST,
        port: process.env.G_SMTP_PORT,
        auth: {
            user: process.env.G_SMTP_USERNAME,
            pass: process.env.G_SMTP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: process.env.G_SMTP_USERNAME,
        to,
        subject,
        html: text
    });
};