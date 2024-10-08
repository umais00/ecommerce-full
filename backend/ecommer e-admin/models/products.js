const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  productlink: { type: String },
  category: { type: String, required: true },
  brand: { type: String, required: true },
});

module.exports = mongoose.model("Product", productSchema);
