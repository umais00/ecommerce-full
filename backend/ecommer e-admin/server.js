const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const multer = require("multer");
const path = require("path");

// Import routes
const usersRouter = require("./routes/users");
const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const statsRouter = require("./routes/stats");

// Set up storage location and file naming for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../../frontend/assets/products")); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Filename with timestamp
  },
});

const upload = multer({ storage: storage });

const app = express();
const port = process.env.PORT || 5000;

// Middleware to handle CORS and JSON parsing
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // Replace with your frontend URL
  })
);
app.use(bodyParser.json());

// Serve static files
app.use(
  "/assets/products",
  express.static(path.join(__dirname, "../../../frontend/assets/products"))
);

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

// Register routes
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter); // Products routes include the update functionality
app.use("/api/orders", ordersRouter);
app.use("/api/stats", statsRouter); // Register the stats routes

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
