const Order = require("../models/order");

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user").populate("products");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      address,
      city,
      state,
      postalCode,
      phone,
      orderNotes,
      products = [],
      totalAmount = 0,
    } = req.body;

    if (
      !email ||
      !firstName ||
      !lastName ||
      !address ||
      !city ||
      !state ||
      !postalCode ||
      !phone
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = new Order({
      user: {
        email,
        firstName,
        lastName,
        address,
        city,
        state,
        postalCode,
        phone,
      },
      products,
      totalAmount,
      orderNotes,
    });

    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Error creating order:", err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
