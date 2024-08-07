const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.get("/", usersController.getUsers);
router.post("/", usersController.createUser);

// Add other routes similarly...

module.exports = router;
