const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/productController");

// GET all products
router.get("/", ProductController.getProducts);

// POST a new product
router.post("/", ProductController.createProduct);

// You can add more routes for other CRUD operations here

module.exports = router;
