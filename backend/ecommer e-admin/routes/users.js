const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs"); // Import bcrypt for password hashing and comparison

// POST /api/users/register
router.post("/register", async (req, res) => {
  const { name, email, password, address, contact } = req.body;

  if (!name || !email || !password || !address || !contact) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before saving
    const newUser = new User({
      name,
      email,
      password: hashedPassword, // Save hashed password
      address,
      contact,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error(error);
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

    // Simulate a token (in a real application, you'd generate a JWT or similar)
    const token = "fake-jwt-token"; // Replace with real token generation

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

module.exports = router;
