const gmailSend = require("gmail-send"); // Use require to import the module
require("dotenv").config(); // Load environment variables from .env

async function sendOTP(to, otp) {
  const send = gmailSend({
    user: "professional.umais@gmail.com", // Your Gmail username
    pass: "aggy puaj wkby fzbs", // Your Gmail app password (from .env)
    to, // Recipient address
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}.`, // Email body
  });

  try {
    const result = await send(); // Send the email
    console.log("OTP sent successfully:", result);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendOTP;
