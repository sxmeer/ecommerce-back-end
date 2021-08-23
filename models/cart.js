const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const cartProductSchema = new mongoose.Schema({
  product: {
    type: ObjectId,
    ref: "Product"
  },
  count: {
    type: Number
  },
  totalPrice: {
    type: Number
  }
});

cartProductSchema.statics.calculateTotalPrice = function (cartProduct) {
  return cartProduct.product.price * cartProduct.count;
}

const CartProduct = mongoose.model("CartProduct", cartProductSchema);

const cartSchema = new mongoose.Schema({
  products: [cartProductSchema],
  totalPrice: {
    type: Number
  },
  user: {
    type: ObjectId,
    ref: "User"
  }
}, { timestamps: true });

cartSchema.statics.calculateTotalPrice = function (cart) {
  return cart.products.reduce((sum, product) => {
    return sum + product.totalPrice;
  }, 0);
}

const Cart = mongoose.model("Cart", cartSchema);

module.exports = {
  CartProduct, Cart
}