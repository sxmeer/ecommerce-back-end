const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middlewares/auth");
const { createOrder, getOrderDetail } = require("../controllers/payment");
const { getUserById } = require("../controllers/user");

router.post("/order/create", createOrder);

router.get("/order/details",
  getUserById,
  isLoggedIn,
  getOrderDetail
);

module.exports = router;