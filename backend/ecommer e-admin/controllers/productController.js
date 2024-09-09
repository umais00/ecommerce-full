const Product = require("../models/products");

exports.getProducts = async (req, res) => {
  try {
    const { categories, brands } = req.query;
    let query = {};

    // Filter by categories if provided
    if (categories) {
      query.category = { $in: categories.split(",") };
    }

    // Filter by brands if provided
    if (brands) {
      query.brand = { $in: brands.split(",") };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add this function to your controller file
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    stock: req.body.stock,
    productlink: req.file ? `assets/products/${req.file.filename}` : null, // Save the image path
    category: req.body.category,
    brand: req.body.brand,
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    // Find the product by ID
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the product details
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.stock = req.body.stock || product.stock;
    product.productlink = req.file
      ? `assets/products/${req.file.filename}`
      : product.productlink;
    product.category = req.body.category || product.category;
    product.brand = req.body.brand || product.brand;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.deleteProduct = async (req, res) => {
  const proid = req.params.id;
  try {
    const result = await Product.findByIdAndDelete(proid);
    if (!result) {
      return res.status(404).json({ message: "product not found" });
    }
    res.status(200).json({ message: "product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.rStock = async (req, res) => {
  try {
    const productId = req.params.id; // Use `id` to match the route parameter
    const { quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough stock" });
    }

    product.stock -= quantity;
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    console.error("Error reducing product stock:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
