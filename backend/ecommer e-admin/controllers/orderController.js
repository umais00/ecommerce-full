const Order = require("../models/order");
const Product = require("../models/products"); // Import the Product model
const jwt = require("jsonwebtoken");
const User = require("../models/user");

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

    // Generate a custom order ID (e.g., using current timestamp or any logic you prefer)
    const customOrderId = `ORD-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;

    const order = new Order({
      orderId: customOrderId, // Assign the custom order ID
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

exports.acceptOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = "Accepted";
    await order.save();

    // Reduce stock for each product in the order
    for (const item of order.products) {
      try {
        await Product.findByIdAndUpdate(item.id, {
          $inc: { stock: -item.quantity },
        });
      } catch (productError) {
        console.error("Error updating product stock:", productError);
        return res
          .status(500)
          .json({ success: false, message: "Error updating product stock" });
      }
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error accepting order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.completeOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.status === "Completed") {
      return res
        .status(400)
        .json({ success: false, message: "Order is already completed" });
    }

    order.status = "Completed";
    await order.save();

    res.json({ success: true, message: "Order marked as completed" });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getUserOrders = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify the token and extract the user's ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Use the email from the user model to find the orders
    const orders = await Order.find({ "user.email": user.email });

    if (!orders || orders.length === 0) {
      return res.json({ message: "No orders found" });
    }

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
