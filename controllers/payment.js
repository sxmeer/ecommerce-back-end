const Razorpay = require('razorpay');
const shortid = require('shortid');
const crypto = require('crypto');

const { Cart } = require("../models/cart");
const { Order, PAYMENT_METHOD, PAYMENT_STATUS, ORDER_STATUS } = require("../models/order");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = (req, res, next) => {
  const digest = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    // legit response
    const paymentEntity = req.body.payload.payment.entity;
    const transactionId = paymentEntity.order_id;
    const address = paymentEntity.notes.billingAddress;
    const user = paymentEntity.notes.user_id;
    if (!transactionId || !address || !user) {
      let error = new Error("incomplete details found");
      error.status = 422;
      throw error;
    }
    Cart.findOne({ user })
      .populate("products.product", "-__v -createdAt -updatedAt")
      .then(cart => {
        if (!cart) {
          let error = new Error("no cart found for the user");
          error.status = 422;
          throw error;
        }
        let orderObj = {
          products: cart.products,
          transactionId,
          totalPrice: cart.totalPrice,
          address,
          orderStatus: ORDER_STATUS.STATUS_NEW,
          paymentStatus: PAYMENT_STATUS.STATUS_PAID,
          paymentMethod: PAYMENT_METHOD.METHOD_ONLINE_PAYMENT,
          user
        };
        let newOrder = new Order(orderObj);
        return newOrder.save();
      })
      .then(insertedOrder => {
        if (!insertedOrder) {
          let error = new Error("Error occurred creating order");
          error.status = 500;
          throw error;
        }
        return Cart.findOneAndDelete({ user });
      })
      .then(() => {
        return res.status(200).json({ status: 'ok' });
      })
      .catch(err => {
        return next(err);
      });
  } else {
    //forged response
    return res.status(500).json({
      status: 'not-ok'
    });
  }
};


exports.getOrderDetail = (req, res, next) => {
  Cart.findOne({ _id: req.profile._id })
    .then(cart => {
      if (!cart) {
        let error = new Error("No items in the cart to be checked out");
        error.status = 422;
        throw error;
      }
      const options = {
        amount: cart.totalPrice * 100,
        currency: 'INR',
        receipt: shortid.generate(),
        payment_capture: 1
      };
      return razorpay.orders.create(options);
    })
    .then(razorpayOrder => {
      if (!razorpayOrder) {
        let error = new Error("Error creating order");
        error.status = 500;
        throw error;
      }
      return res.status(200).json({
        order_id: razorpayOrder.id,
        currency: razorpayOrder.currency,
        amount: razorpayOrder.amount
      });
    })
    .catch(err => {
      return next(err);
    });
};