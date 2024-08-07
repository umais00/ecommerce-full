const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orderController");

router.get("/", ordersController.getOrders);
router.post("/", ordersController.createOrder);

// Add other routes similarly...

module.exports = router;
