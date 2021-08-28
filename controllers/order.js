const { Order,
  PAYMENT_METHOD,
  PAYMENT_STATUS, PAYMENT_STATUS_VALUES,
  ORDER_STATUS, ORDER_STATUS_VALUES,
  ORDER_PAGINATION_CONFIG } = require("../models/order");
const { Cart } = require("../models/cart");
const { USER_TYPES } = require("../models/user");
const { removeUnncessaryFields } = require("../utils/utility");

//creation of an order
//address in the body
exports.createOrder = (req, res, next) => {
  Cart.findOne({ user: req.profile._id })
    .populate("products.product", "-__v -createdAt -updatedAt")
    .then(cart => {
      if (!cart) {
        let error = new Error("No items to checkout");
        error.status = 400;
        throw error;
      }
      let productsObj = cart.products.map(productWrapper => {
        return {
          _id: productWrapper._id,
          product: {
            image: {
              imageUrl: productWrapper.product.image.imageUrl,
              imageName: productWrapper.product.image.imageName
            },
            _id: productWrapper.product._id,
            name: productWrapper.product.name,
            description: productWrapper.product.description,
            price: productWrapper.product.price
          },
          count: productWrapper.count,
          totalPrice: productWrapper.totalPrice
        };
      });
      let orderObj = {
        products: productsObj,
        totalPrice: cart.totalPrice,
        address: req.body.address,
        orderStatus: ORDER_STATUS.STATUS_NEW,
        paymentStatus: PAYMENT_STATUS.STATUS_NOT_PAID,
        paymentMethod: PAYMENT_METHOD.METHOD_COD,
        user: req.profile._id
      };
      let newOrder = new Order(orderObj);
      return newOrder.save();
    })
    .then(order => {
      if (!order) {
        let error = new Error("Error creating order");
        error.status = 400;
        throw error;
      }
      return Cart.findOneAndDelete({ user: req.profile._id })
    })
    .then(() => {
      return res.status(200).json({ status: 'ok' });
    })
    .catch(err => {
      return next(err);
    });
};

//updation of the order by admin
// ?orderId=
//req.body : {paymentStatus, orderStatus}
exports.editOrder = (req, res, next) => {
  let orderId = req.query.orderId;
  if (!orderId) {
    let error = new Error("Please provide order id");
    error.status = 422;
    throw error;
  }
  let { paymentStatus, orderStatus } = req.body;
  Order.findOneAndUpdate({ _id: orderId },
    { $set: { paymentStatus, orderStatus } },
    { new: true, runValidators: true, omitUndefined: true, useFindAndModify: false })
    .populate("user", "_id email firstName lastName")
    .then(updatedOrder => {
      if (!updatedOrder) {
        let error = new Error("No order found");
        error.status = 422;
        throw error;
      }
      updatedOrder = removeUnncessaryFields(updatedOrder)
      return res.status(200).json(updatedOrder);
    })
    .catch(err => {
      return next(err);
    });
};

//gets all the orders of all the users 
//for admins all orders listing userRole? TYPE_ADMIN
// ?orderId, ?orderStatus, ?paymentStatus, for search
// ?page, ?limit
exports.getAllOrders = (req, res, next) => {
  let limit;
  let page;
  if (req.query.limit) {
    let tempLimit = parseInt(req.query.limit);
    if (!isNaN(tempLimit) && tempLimit > 0) {
      limit = tempLimit;
    } else {
      let error = new Error("Please provide positive integer limit");
      error.status = 422;
      throw error;
    }
  } else {
    limit = ORDER_PAGINATION_CONFIG.DEFAULT_LIMIT;
  }
  if (req.query.page) {
    let tempPage = parseInt(req.query.page);
    if (!isNaN(tempPage) && tempPage > 0) {
      page = tempPage;
    } else {
      let error = new Error("Please provide positive integer page");
      error.status = 422;
      throw error;
    }
  } else {
    page = ORDER_PAGINATION_CONFIG.DEFAULT_PAGE;
  }
  let searchParams = {};
  if (req.query.orderId) {
    searchParams._id = req.query.orderId;
  }
  if (req.query.orderStatus) {
    if (ORDER_STATUS_VALUES.includes(req.query.orderStatus)) {
      searchParams.orderStatus = req.query.orderStatus;
    } else {
      let error = new Error(`Please provide status values in ${ORDER_STATUS_VALUES.join(", ")}`);
      error.status = 422;
      throw error;
    }
  }
  if (req.query.paymentStatus) {
    if (PAYMENT_STATUS_VALUES.includes(req.query.paymentStatus)) {
      searchParams.paymentStatus = req.query.paymentStatus;
    } else {
      let error = new Error(`Please provide payment values in ${PAYMENT_STATUS_VALUES.join(", ")}`);
      error.status = 422;
      throw error;
    }
  }
  if (req.query.userRole) {
    if (req.query.userRole === USER_TYPES.TYPE_ADMIN) {
      if (req.profile.role !== USER_TYPES.TYPE_ADMIN) {
        let error = new Error("ACCESS NOT GRANTED");
        error.status = 401;
        throw error;
      }
    } else {
      searchParams.user = req.profile._id;
    }
  } else {
    searchParams.user = req.profile._id;
  }
  let resObj = {};
  Order.find(searchParams)
    .select("-__v -createdAt -updatedAt")
    .sort({ _id: 'asc' })
    .limit(limit)
    .skip((page - 1) * limit)
    .populate("user", "_id email firstName lastName")
    .then(orders => {
      resObj.limit = limit;
      resObj.page = page;
      resObj.count = orders.length;
      resObj.orders = orders;
      return Order.countDocuments(searchParams);
    })
    .then(totalOrders => {
      resObj.totalOrders = totalOrders;
      return res.status(200).json(resObj);
    })
    .catch(err => {
      return next(err);
    });
};