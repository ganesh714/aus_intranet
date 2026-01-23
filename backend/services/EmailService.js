// backend/services/EmailService.js
const nodemailer = require('nodemailer');
const authEmitter = require('../events/AuthEvents');
require('dotenv').config();
// Configure Transporter once
const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_PASS,
    },
});
// THE OBSERVER LOGIC
// We listen for the 'passwordReset' event
authEmitter.on('passwordReset', async ({ email, newPassword }) => {
    console.log(`[Observer] Detecting password reset for ${email}. Sending email...`);

    const mailOptions = {
        from: process.env.GOOGLE_EMAIL,
        to: email, // Assuming ID is email, or we passed email
        subject: 'Your New Password',
        text: `Your new password is: ${newPassword}. Use this password to log in to the system.`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Observer] Email sent successfully to ${email}`);
    } catch (error) {
        console.error("[Observer] Failed to send email:", error);
    }
});
module.exports = {
    // We export a "init" just to make sure this file is loaded/run by server
    init: () => console.log('Email Service (Observer) Initialized')
};
