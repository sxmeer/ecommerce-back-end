const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/auth");
const { getUserById, getUser } = require("../controllers/user");

router.get("/", getUserById, isLoggedIn, getUser);

module.exports = router;
