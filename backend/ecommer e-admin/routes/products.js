const express = require("express");
const router = express.Router();
const productsController = require("../controllers/productController");

router.get("/", productsController.getProducts);
router.post("/", productsController.createProduct);

// Add other routes similarly...

module.exports = router;
