const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendOTP = require("../utils/mailer");
const multer = require("multer");
const UserController = require("../controllers/userController");
let temporaryUserStore = {};

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit file size to 5MB
});

// POST /api/validate-token
router.post("/validate-token", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ role: user.role });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
});

// POST /api/users/verify-otp
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  console.log(`Received OTP Verification Request: email=${email}, otp=${otp}`);

  if (!email || !otp) {
    console.log("Bad Request: Missing email or OTP");
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    const tempUser = temporaryUserStore[email];

    if (!tempUser) {
      console.log("User not found:", email);
      return res.status(404).json({ message: "User not found." });
    }

    console.log(`Stored OTP for ${email}: ${tempUser.otp}`);
    console.log(`Received OTP: ${otp}`);

    if (tempUser.otp !== otp || tempUser.otpExpires < Date.now()) {
      console.log("Invalid or expired OTP");
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Hash the password and create the user in the database
    const hashedPassword = await bcrypt.hash(tempUser.password, 10);
    const newUser = new User({
      name: tempUser.name,
      email: tempUser.email,
      password: hashedPassword,
      city: tempUser.city,
      province: tempUser.province,
      address: tempUser.address,
      pcode: tempUser.pcode,
      contact: tempUser.contact,
      isActive: true,
    });

    await newUser.save();

    // Clear temporary user data
    delete temporaryUserStore[email];

    console.log("OTP successfully verified and account activated");
    res.status(200).json({
      message: "OTP verified successfully. Your account is now activated.",
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// POST /api/users/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "25h",
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// GET /api/users/me
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// Example using Express.js
router.patch("/:id", async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /:id (no need for /api/users prefix here)
router.delete("/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/users/manual-create
router.post("/manual-create", async (req, res) => {
  const {
    name,
    email,
    password,
    city,
    province,
    address,
    pcode,
    contact,
    role,
  } = req.body;

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Name, email, password, and role are required." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name, // Add name
      email,
      password: hashedPassword,
      city,
      province,
      address,
      pcode,
      contact, // Add contact
      role,
      isActive: true,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// POST /api/users/register
router.post("/register", async (req, res) => {
  // Extract user details from request body
  const { name, email, password, city, province, address, pcode, contact } =
    req.body;

  // Check if all required fields are provided
  if (
    !name ||
    !email ||
    !password ||
    !city ||
    !province ||
    !address ||
    !pcode ||
    !contact
  ) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Generate OTP and send it to the user's email
    const otp = crypto.randomInt(100000, 999999).toString();
    await sendOTP(email, otp);

    // Store user details temporarily with OTP information
    temporaryUserStore[email] = {
      name,
      email,
      password, // Note: In a real-world application, you should hash the password before storing it
      city,
      province,
      address,
      pcode,
      contact,
      otp,
      otpExpires: Date.now() + 15 * 60 * 1000, // OTP expires in 15 minutes
    };

    // Respond with success message
    res.status(201).json({
      message:
        "User registered successfully. Please verify your email with the OTP sent.",
    });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// Add multer to the update route
router.put("/update", upload.single("pfp"), async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("User before update:", user);

    user.name = req.body.name;
    user.email = req.body.email;
    user.address = req.body.address;
    user.contact = req.body.contact;
    user.city = req.body.city;
    user.province = req.body.province;
    user.pcode = req.body.pcode;

    if (req.file) {
      console.log("Updating user image...");
      user.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    await user.save();

    console.log("User after update:", user);

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
