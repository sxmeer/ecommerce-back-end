const express = require("express");
const router = express.Router();
const { body } = require('express-validator');
const { User } = require("../models/user");
const { signUp, logIn, logOut } = require('../controllers/auth');
const { isLoggedIn } = require('../middlewares/auth');
const { getUserById } = require("../controllers/user");

router.post('/signup',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage("Please enter proper email")
      .normalizeEmail({ "all_lowercase": true })
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject("E-mail address already exists");
          }
        })
      }),
    body('firstName')
      .trim()
      .isLength({ min: 3, max: 32 })
      .withMessage("Please enter first name with min 3 and max 32 characters")
      .isAlpha()
      .withMessage("Please enter first name as alpha(a-z A-Z) values")
    ,
    body('lastName')
      .trim()
      .isLength({ min: 3, max: 32 })
      .withMessage("Please enter last name with min 3 and max 32 characters")
      .isAlpha()
      .withMessage("Please enter last name as alpha(a-z A-Z) values")
    ,
    body("password", "Please enter password with min 5 alphanumric(a-z A-Z 0-9) characters")
      .trim()
      .isAlphanumeric()
      .isLength({ min: 5 }),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("password and confirm password should match");
        }
        return true;
      })
  ],
  signUp
);

router.post('/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage("Please enter proper email")
      .normalizeEmail({ "all_lowercase": true }),
    body('password')
      .isLength({ min: 1 })
      .withMessage("Please enter password")
  ]
  , logIn);

router.post('/logout', getUserById, isLoggedIn, logOut);

module.exports = router;
