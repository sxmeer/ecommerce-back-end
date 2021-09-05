const mongoose = require('mongoose');
const crypto = require('crypto');
const { v1: uuidv1 } = require('uuid');

const USER_TYPES = {
  TYPE_ADMIN: "TYPE_ADMIN",
  TYPE_REGULAR: "TYPE_REGULAR"
};

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    maxlength: 32,
    minLength: 3,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 32,
    minLength: 3,
    trim: true
  },
  email: {
    type: String,
    required: true,
    uniquie: true,
    trim: true
  },
  encryptedPassword: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
  },
  role: {
    type: String,
    default: USER_TYPES.TYPE_REGULAR,
    enum: [USER_TYPES.TYPE_ADMIN, USER_TYPES.TYPE_REGULAR]
  }
}, { timestamps: true });

userSchema.virtual("password")
  .set(function (password) {
    this.salt = uuidv1();
    this.encryptedPassword = this.encyrptPassword(password);
  });

userSchema.methods = {
  authenticate: function (password) {
    return this.encryptedPassword === this.encyrptPassword(password);
  },
  encyrptPassword: function (password) {
    if (!password) {
      return "";
    }
    try {
      return crypto
        .createHmac('sha256', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return "";
    }
  }
}

const User = mongoose.model("User", userSchema);

module.exports = {
  USER_TYPES, User
}