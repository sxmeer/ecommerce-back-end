const express = require("express");
const router = express.Router();
const { getUserById } = require("../controllers/user");
const { createProduct, updateProduct, getProductById } = require("../controllers/product");
const { isLoggedIn, isAdmin } = require('../middlewares/auth');

router.post("/create",
  getUserById,
  isLoggedIn,
  isAdmin,
  createProduct);

router.patch("/update",
  getUserById,
  isLoggedIn,
  isAdmin,
  getProductById,
  updateProduct);


module.exports = router;
