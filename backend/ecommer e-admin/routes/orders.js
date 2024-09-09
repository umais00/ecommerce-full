const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orderController");
const authenticateToken = require("../middleware/auth");

// Apply middleware to the protected route
router.get("/user-orders", authenticateToken, ordersController.getUserOrders);

// Other routes (if applicable)
router.get("/", ordersController.getOrders);
router.post("/", ordersController.createOrder);
router.delete("/:id", ordersController.deleteOrder);
router.patch("/:id/accept", ordersController.acceptOrder);
router.patch("/:id/complete", ordersController.completeOrder);

module.exports = router;
