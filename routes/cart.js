const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/auth");
const { getUserById } = require("../controllers/user");
const { getProductById } = require("../controllers/product");
const { addProductToCart,
  removeProductFromCart,
  getCart } = require("../controllers/cart");

router.put("/add",
  getUserById,
  isLoggedIn,
  getProductById,
  addProductToCart
);

router.put("/remove",
  getUserById,
  isLoggedIn,
  getProductById,
  removeProductFromCart
);

router.get("/",
  getUserById,
  isLoggedIn,
  getCart
)


module.exports = router;
