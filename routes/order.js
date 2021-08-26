const express = require("express");
const router = express.Router();
const {
  editOrder,
  getAllOrders,
  createOrder } = require("../controllers/order");
const { isLoggedIn, isAdmin } = require("../middlewares/auth");
const { getUserById } = require("../controllers/user");


router.put("/create",
  getUserById,
  isLoggedIn,
  createOrder
);

router.patch("/edit",
  getUserById,
  isLoggedIn,
  isAdmin,
  editOrder
);

router.get("/all",
  getUserById,
  isLoggedIn,
  getAllOrders
);

module.exports = router;
