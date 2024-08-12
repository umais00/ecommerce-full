const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables from .env

async function sendOTP(to, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use Gmail service
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL, // Sender address
      to,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}.`,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendOTP;
