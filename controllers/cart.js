const { Cart, CartProduct, DELIVERY_CONFIG } = require("../models/cart");
const { removeUnncessaryFields } = require("../utils/utility");

exports.addProductToCart = (req, res, next) => {
  let productCount;
  if (req.query.productCount) {
    let temp = parseInt(req.query.productCount);
    if (!isNan(temp) && temp > 0 && temp <= DELIVERY_CONFIG.PER_PRODUCT_COUNT_PER_ORDER) {
      productCount = temp;
    } else {
      let error = new Error("Please provide product count between 1 and 10 inclusive");
      error.status = 422;
      throw error;
    }
  } else {
    productCount = 1;
  }
  Cart.findOne({ user: req.profile._id })
    .then((cart) => {
      if (!cart) {
        let error = new Error("cannot find cart of the user");
        error.status = 404;
        throw error;
      }
      return cart;
    })
    .catch((err) => {
      let newCart = new Cart({ products: [] });
      return newCart;
    })
    .then((cart) => {
      if (cart.products.length === DELIVERY_CONFIG.PRODUCTS_PER_ORDER) {
        let error = new Error(`Cart can only have ${DELIVERY_CONFIG.PRODUCTS_PER_ORDER} products`);
        error.status = 422;
        throw error;
      }
      let index = cart.products.findIndex((_) => String(_.product) === String(req.product._id));
      if (index > -1) {
        let cartProduct = cart.products[index];
        if (cartProduct.count + productCount > DELIVERY_CONFIG.PER_PRODUCT_COUNT_PER_ORDER) {
          let error = new Error(`per product can only be ${DELIVERY_CONFIG.PER_PRODUCT_COUNT_PER_ORDER}`);
          error.status = 404;
          throw error;
        } else {
          cartProduct.count = cartProduct.count + productCount;
          cartProduct.totalPrice = CartProduct.calculateTotalPrice(cartProduct, req.product);
        }
      } else {
        let cartProduct = new CartProduct({
          product: req.product._id,
          count: productCount,
        });
        cartProduct.totalPrice = CartProduct.calculateTotalPrice(cartProduct, req.product);
        cart.products.push(cartProduct);
      }
      let toBeUpdatedCart = {
        products: cart.products,
        user: req.profile._id,
      };
      toBeUpdatedCart.totalPrice = Cart.calculateTotalPrice(toBeUpdatedCart)
      return Cart.findOneAndUpdate({ _id: cart._id },
        { $set: toBeUpdatedCart },
        { new: true, runValidators: true, omitUndefined: true, useFindAndModify: false, upsert: true })
        .populate("products.product", "-__v -createdAt -updatedAt");
    })
    .then(updatedCart => {
      if (!updatedCart) {
        throw new Error("item not added in the cart");
      }
      updatedCart = removeUnncessaryFields(updatedCart);
      return res.status(200).json(updatedCart);
    })
    .catch(err => {
      return next(err);
    })
};

exports.removeProductFromCart = (req, res, next) => {
  Cart.findOne({ user: req.profile._id })
    .then((cart) => {
      if (!cart) {
        let error = new Error("No cart for user");
        error.status = 404;
        throw error;
      }
      let prodIndex = cart.products.findIndex((_) => String(_.product) === String(req.product._id));
      if (prodIndex > -1) {
        cart.products.splice(prodIndex, 1);
        cart.totalPrice = Cart.calculateTotalPrice(cart);
        return Cart.findOneAndUpdate({ _id: cart._id },
          { $set: { products: cart.products, totalPrice: cart.totalPrice } },
          { new: true, runValidators: true, omitUndefined: true, useFindAndModify: false })
          .populate("products.product", "-__v -createdAt -updatedAt");
      } else {
        let error = new Error("No such items found in the cart");
        error.status = 404;
        throw error;
      }
    })
    .then(updatedCart => {
      updatedCart = removeUnncessaryFields(updatedCart);
      return res.status(200).json(updatedCart);
    })
    .catch(err => {
      return next(err);
    })
};

exports.getCart = (req, res, next) => {
  Cart.findOne({ user: req.profile._id })
    .populate("products.product", "-__v -createdAt -updatedAt")
    .then(cart => {
      if (!cart) {
        let responseCart = {
          products: [],
          totalPrice: 0,
          user: req.profile._id
        };
        return res.status(200).json(responseCart);
      } else {
        cart = removeUnncessaryFields(cart);
        return res.status(200).json(cart);
      }
    })
    .catch(err => {
      return next(err);
    });
}