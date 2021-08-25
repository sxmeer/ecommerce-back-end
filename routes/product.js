const express = require("express");
const router = express.Router();
const { getUserById } = require("../controllers/user");
const {
  createProduct,
  updateProduct,
  getProductById,
  getProduct,
  deleteProduct,
  getAllProducts } = require("../controllers/product");
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

router.delete("/delete",
  getUserById,
  isLoggedIn,
  isAdmin,
  getProductById,
  deleteProduct
);

router.get("/all",
  getAllProducts);

router.get("/",
  getProductById,
  getProduct
)

module.exports = router;
