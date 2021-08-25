const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Name field is required"],
    maxlength: [32, "Name can only be 32 characters long"],
    minLength: [5, "Name should be minimum 5 characters"]
  },
  description: {
    type: String,
    trim: true,
    required: [true, "Description field is required"],
    maxlength: [2000, "Description can only be 2000 characters long"],
    minLength: [10, "Description should be minimum 10 characters"]
  },
  price: {
    type: Number,
    required: [true, "Price field is required"]
  },
  image: {
    imageUrl: {
      type: String,
      required: [true, "Product image is required"]
    },
    imageName: {
      type: String
    }
  }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
const imageType = ["image/png", "image/jpeg"];

module.exports = { Product, imageType };