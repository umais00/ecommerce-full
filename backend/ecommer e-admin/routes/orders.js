const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orderController");

router.get("/", ordersController.getOrders);
router.post("/", ordersController.createOrder);
router.delete("/:id", ordersController.deleteOrder); // Add the delete route

module.exports = router;
