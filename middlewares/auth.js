const jwt = require('express-jwt');
const { USER_TYPES } = require('../models/user');

const expressJwt = jwt({
  userProperty: "auth",
  algorithms: ['HS256'],
  secret: process.env.PASSWORD_SECRET
});

const isAuthenticated = (req, res, next) => {
  let isAuth = req.profile && req.auth && req.auth.id == req.profile._id;
  if (!isAuth) {
    let error = new Error("ACCESS DENIED");
    error.status = 401;
    throw error;
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.profile.role !== USER_TYPES.TYPE_ADMIN) {
    let error = new Error("ADMIN PRIVILEGES NOT PERMITTED");
    error.status = 403;
    throw error;
  }
  next();
}

const isLoggedIn = [expressJwt, isAuthenticated];

module.exports = {
  isLoggedIn, isAdmin
}