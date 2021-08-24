const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const ORDER_STATUS = {
  STATUS_NEW: "STATUS_NEW",
  STATUS_PROCESSING: "STATUS_PROCESSING",
  STATUS_SHIPPED: "STATUS_SHIPPED",
  STATUS_DELIVERED: "STATUS_DELIVERED"
};
const PAYMENT_STATUS = {
  STATUS_NOT_PAID: "STATUS_NOT_PAID",
  STATUS_PAID: "STATUS_PAID"
};
const PAYMENT_METHOD = {
  METHOD_COD: "METHOD_COD",
  METHOD_ONLINE_PAYMENT: "METHOD_ONLINE_PAYMENT"
};

const orderSchema = new mongoose.Schema({
  products: {
    type: Array,
    default: []
  },
  transactionId: {
    type: String
  },
  totalPrice: {
    type: Number
  },
  address: {
    type: String,
    trim: true,
  },
  orderStatus: {
    type: String,
    default: ORDER_STATUS.STATUS_NEW,
    enum: [
      ORDER_STATUS.STATUS_NEW,
      ORDER_STATUS.STATUS_PROCESSING,
      ORDER_STATUS.STATUS_SHIPPED,
      ORDER_STATUS.STATUS_DELIVERED
    ]
  },
  paymentStatus: {
    type: String,
    default: PAYMENT_STATUS.STATUS_NOT_PAID,
    enum: [PAYMENT_STATUS.STATUS_NOT_PAID, PAYMENT_STATUS.STATUS_PAID]
  },
  paymentMethod: {
    type: String,
    default: PAYMENT_METHOD.METHOD_COD,
    enum: [PAYMENT_METHOD.METHOD_COD, PAYMENT_METHOD.METHOD_ONLINE_PAYMENT]
  },
  user: {
    type: ObjectId,
    ref: "User"
  }
}, { timestamps: true });

orderSchema.statics.calculateTotalPrice = function (order) {
  return order.products.reduce((sum, product) => {
    return sum + product.totalPrice;
  }, 0);
}

const Order = mongoose.model("Order", orderSchema);

module.exports = {
  Order, PAYMENT_METHOD, PAYMENT_STATUS, ORDER_STATUS
}