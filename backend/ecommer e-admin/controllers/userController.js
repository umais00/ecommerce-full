const User = require("../models/user");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    city,
    province,
    address,
    pcode,
    contact,
  } = req.body;
  const user = new User({
    name,
    email,
    password,
    role,
    city,
    province,
    address,
    pcode,
    contact,
    image: {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    },
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Add other CRUD functions similarly...
