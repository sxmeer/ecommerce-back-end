const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const DELIVERY_CONFIG = {
  PER_PRODUCT_COUNT_PER_ORDER: 5,
  PRODUCTS_PER_ORDER: 10
}

const cartProductSchema = new mongoose.Schema({
  product: {
    type: ObjectId,
    ref: "Product",
    required: true
  },
  count: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

cartProductSchema.statics.calculateTotalPrice = function (cartProduct, product) {
  return product.price * cartProduct.count;
}

const CartProduct = mongoose.model("CartProduct", cartProductSchema);

const cartSchema = new mongoose.Schema({
  products: {
    type: [cartProductSchema],
    default: []
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  user: {
    type: ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

cartSchema.statics.calculateTotalPrice = function (cart) {
  return cart.products.reduce((sum, product) => {
    return sum + product.totalPrice;
  }, 0);
}

const Cart = mongoose.model("Cart", cartSchema);

module.exports = {
  CartProduct, Cart, DELIVERY_CONFIG
}