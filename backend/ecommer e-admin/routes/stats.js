const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statscontroller");

// Define the routes
router.get("/users/stats", statsController.getUserStats);
router.get("/orders/stats", statsController.getOrderStats);
router.get("/products/stats", statsController.getProductStats);

module.exports = router;
