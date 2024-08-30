const Product = require("../models/products");
const Order = require("../models/order");
const User = require("../models/user");

const getUserStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.json({ userCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user stats." });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();
    res.json({ orderCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching order stats." });
  }
};

const getProductStats = async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    res.json({ productCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product stats." });
  }
};

module.exports = {
  getUserStats,
  getOrderStats,
  getProductStats,
};
