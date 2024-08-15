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

exports.createProduct = async (req, res) => {
  const product = new Product(req.body);
  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
