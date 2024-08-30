const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "editor", "viewer"],
    default: "viewer",
  },
  city: { type: String, required: true },
  province: { type: String, required: true },
  address: { type: String, required: true },
  pcode: { type: Number, required: true },
  contact: { type: String, required: true },
  image: {
    data: Buffer,
    contentType: String,
  },
});

module.exports = mongoose.model("User", userSchema);
