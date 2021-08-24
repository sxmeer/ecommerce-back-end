const { User } = require('../models/user');

module.exports.getUserById = (req, res, next) => {
  const userId = req.query.userId;
  if (!userId) {
    let error = new Error("Please provide userId");
    error.status = 400;
    throw error;
  }
  User.findOne({ _id: userId })
    .then(userDoc => {
      if (!userDoc) {
        let error = new Error("User not found");
        error.status = 404;
        throw error;
      }
      req.profile = userDoc;
      next();
    }).catch((err) => {
      next(err);
    });
};