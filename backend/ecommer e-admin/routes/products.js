const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require("../models/products");
const ProductController = require("../controllers/productController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../../frontend/assets/products"); // Set your directory here
  },
  filename: (req, file, cb) => {
    // Get product name from request body
    const productName = req.body.name || "product";
    const safeProductName = productName.replace(/[^a-zA-Z0-9]/g, "_"); // Sanitize product name
    const extension = path.extname(file.originalname); // Get file extension
    cb(null, `${safeProductName}${extension}`);
  },
});

const upload = multer({ storage: storage });

// GET all products
router.get("/", ProductController.getProducts);

router.get("/:id", ProductController.getProductById);

// POST a new product
file: router.post("/", upload.single("image"), ProductController.createProduct);

router.patch("/:id", upload.single("image"), ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);

module.exports = router;
