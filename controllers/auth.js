const { User } = require('../models/user');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.signUp = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let message = errors.array().map((err) => err.msg).join(", ");
    let error = new Error(message);
    error.status = 422;
    error.data = { errors: errors.array() }
    throw error;
  }
  const { firstName, lastName, email, password } = req.body;
  const user = new User({ firstName, lastName, email, password });
  user.save()
    .then(userDoc => {
      return res.status(201).json({
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        email: userDoc.email,
        id: userDoc._id
      })
    })
    .catch(err => {
      err.status = 500;
      return next(err);
    });
}

exports.logIn = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let message = errors.array().map((err) => err.msg).join(", ");
    let error = new Error(message);
    error.status = 422;
    error.data = { errors: errors.array() }
    throw error;
  }
  const { email, password } = req.body;
  User.findOne({ email })
    .then(userDoc => {
      if (!userDoc) {
        let error = new Error("Invalid email or password");
        error.status = 422;
        throw error;
      }
      if (!userDoc.authenticate(password)) {
        let error = new Error("Invalid email or password");
        error.status = 422;
        throw error;
      }
      const token = jwt.sign({ id: userDoc._id }, process.env.PASSWORD_SECRET);
      const { firstName, lastName, email, _id, role } = userDoc;
      return res.status(200).json({
        token, user: { firstName, lastName, email, _id, role }
      });
    }).catch(err => {
      return next(err);
    });
};

exports.logOut = (req, res, next) => {
  return res.status(200).json({
    message: "user logged out successfully"
  });
};