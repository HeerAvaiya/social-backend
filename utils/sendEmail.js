import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
    console.log("Preparing email to:", to);
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });
    await transporter
        .sendMail({ from: process.env.MAIL_USER, to, subject, html })
        .then(info => console.log("Email sent:", info.response))
        .catch(err => console.error("Email sending failed:", err));
};

export default sendEmail;