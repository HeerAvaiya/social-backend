import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER, 
            pass: process.env.MAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Social Media" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;
