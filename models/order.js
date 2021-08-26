const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const ORDER_PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 5
};

const ORDER_STATUS = {
  STATUS_NEW: "STATUS_NEW",
  STATUS_PROCESSING: "STATUS_PROCESSING",
  STATUS_SHIPPED: "STATUS_SHIPPED",
  STATUS_DELIVERED: "STATUS_DELIVERED"
};
const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

const PAYMENT_STATUS = {
  STATUS_NOT_PAID: "STATUS_NOT_PAID",
  STATUS_PAID: "STATUS_PAID"
};
const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);

const PAYMENT_METHOD = {
  METHOD_COD: "METHOD_COD",
  METHOD_ONLINE_PAYMENT: "METHOD_ONLINE_PAYMENT"
};

const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHOD);

const orderSchema = new mongoose.Schema({
  products: {
    type: Array,
    default: [],
    required: true
  },
  transactionId: {
    type: String
  },
  totalPrice: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    trim: true,
    required: true,
    min: [10, "address should be min 10 characters"],
    max: [50, "address can be maximum 50 characters"]
  },
  orderStatus: {
    type: String,
    default: ORDER_STATUS.STATUS_NEW,
    enum: {
      values: ORDER_STATUS_VALUES,
      message: `values other than ${ORDER_STATUS_VALUES.join(", ")} not supported`
    },
    required: true
  },
  paymentStatus: {
    type: String,
    default: PAYMENT_STATUS.STATUS_NOT_PAID,
    enum: {
      values: PAYMENT_STATUS_VALUES,
      message: `values other than ${PAYMENT_STATUS_VALUES.join(", ")} not supported`
    },
    required: true
  },
  paymentMethod: {
    type: String,
    default: PAYMENT_METHOD.METHOD_COD,
    enum: {
      values: PAYMENT_METHOD_VALUES,
      message: `values other than ${PAYMENT_METHOD_VALUES.join(", ")} not supported`
    },
    required: true
  },
  user: {
    type: ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

orderSchema.statics.calculateTotalPrice = function (order) {
  return order.products.reduce((sum, product) => {
    return sum + product.totalPrice;
  }, 0);
}

const Order = mongoose.model("Order", orderSchema);

module.exports = {
  Order,
  PAYMENT_METHOD, PAYMENT_METHOD_VALUES,
  PAYMENT_STATUS, PAYMENT_STATUS_VALUES,
  ORDER_STATUS, ORDER_STATUS_VALUES,
  ORDER_PAGINATION_CONFIG
}