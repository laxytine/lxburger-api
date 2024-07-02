const nodemailer = require('nodemailer');
require('dotenv').config();

exports.generateOTP = () => {
    let otp = "";
    for (let i = 0; i < 4; i++) {
        const randVal = Math.round(Math.random() * 9);
        otp += randVal;
    }
    return otp;
};

exports.mailTransport = () => 
    nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465, // Typically port 465 is used for secure SMTP
        secure: true, // Use SSL
        auth: {
            user: process.env.EMAIL_USER, // Use environment variable for the email
            pass: process.env.EMAIL_PASS  // Use environment variable for the password
        }
    });