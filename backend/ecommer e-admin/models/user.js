const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Import bcrypt

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "editor", "viewer"],
    default: "viewer",
  },
  address: { type: String, required: true },
  contact: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
