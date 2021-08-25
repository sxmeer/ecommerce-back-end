const { Product, imageType } = require("../models/product");
const { storage } = require("../firebase");
const formidable = require("formidable");
const { v1: uuidv1 } = require('uuid');
const fs = require('fs');

const deleteProductImageFromFirebase = (fileName) => {
  return storage.ref(process.env.FIREBASE_PRODUCT_IMAGES)
    .child(fileName).delete()
    .then(() => {
      return true;
    })
    .catch((err) => {
      console.log(err);
      return true;
    });
};

exports.getProductById = (req, res, next) => {
  let productId = req.query.productId;
  if (!productId) {
    let error = new Error("Please provide product id");
    error.status = 400;
    throw error;
  }
  Product.findOne({ _id: productId })
    .then(productDoc => {
      if (!productDoc) {
        let error = new Error("product not found");
        error.status = 404;
        throw error;
      } else {
        req.product = productDoc;
        next();
      }
    }).catch(err => {
      next(err);
    })
}

exports.createProduct = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      err.status = 422;
      return next(err);
    }
    //handling file
    if (file.productImage) {
      if (file.productImage.size > (2 * 1024 * 1024)) {
        let error = new Error("Please upload file of less than 2 MB");
        error.status = 422;
        return next(error);
      }
      if (!imageType.includes(file.productImage.type)) {
        let error = new Error("Please upload image of type *.jpeg *.jpg *.png");
        error.status = 422;
        return next(error);
      }
      let newFileName = `${uuidv1()}-${file.productImage.name}`;
      let blobObject = fs.readFileSync(file.productImage.path);
      const uploadTask = storage.ref(`${process.env.FIREBASE_PRODUCT_IMAGES}/${newFileName}`).put(blobObject, { contentType: file.productImage.type });
      uploadTask.on(
        "state_changed",
        (snapshot) => { },
        (error) => { return next(error); },
        () => {
          //complete function
          uploadTask.snapshot.ref.getDownloadURL()
            .then((url) => {
              let imageObj = { imageUrl: url, imageName: newFileName };
              fields.image = imageObj;
              let product = new Product(fields);
              return product.save();
            })
            .then(productDoc => {
              if (!productDoc) {
                deleteProductImageFromFirebase(newFileName)
                  .then(() => {
                    let error = new Error("Error creating product");
                    error.status = 422;
                    return next(error);
                  });
              } else {
                productDoc.createdAt = undefined;
                productDoc.updatedAt = undefined;
                productDoc.__v = undefined;
                return res.status(201).json(productDoc);
              }
            })
            .catch((err) => {
              deleteProductImageFromFirebase(newFileName)
                .then(() => {
                  err.status = 422;
                  return next(err);
                });
            });
        });
    } else {
      let error = new Error("Please provide image");
      error.status = 422;
      return next(error);
    }
  })
};

exports.updateProduct = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      err.status = 422;
      return next(err);
    }
    //handling file
    if (file.productImage) {
      if (file.productImage.size > (2 * 1024 * 1024)) {
        let error = new Error("Please upload file of less than 2 MB");
        error.status = 422;
        return next(error);
      }
      if (!imageType.includes(file.productImage.type)) {
        let error = new Error("Please upload image of type *.jpeg *.jpg *.png");
        error.status = 422;
        return next(error);
      }
      let newFileName = `${uuidv1()}-${file.productImage.name}`;
      let blobObject = fs.readFileSync(file.productImage.path);
      const uploadTask = storage.ref(`${process.env.FIREBASE_PRODUCT_IMAGES}/${newFileName}`).put(blobObject, { contentType: file.productImage.type });
      uploadTask.on(
        "state_changed",
        (snapshot) => { },
        (error) => { return next(error); },
        () => {
          //complete function
          uploadTask.snapshot.ref.getDownloadURL()
            .then(url => {
              let imageObj = { imageUrl: url, imageName: newFileName };
              fields.image = imageObj;
              return Product.findOneAndUpdate({ _id: req.product._id },
                { $set: fields },
                { new: true, runValidators: true, omitUndefined: true, useFindAndModify: false });
            })
            .then(productDoc => {
              if (!productDoc) {
                deleteProductImageFromFirebase(newFileName)
                  .then(() => {
                    let error = new Error("Error udating product");
                    error.status = 422;
                    return next(error)
                  });
              } else {
                productDoc.createdAt = undefined;
                productDoc.updatedAt = undefined;
                productDoc.__v = undefined;
                return res.status(201).json(productDoc);
              }
            })
            .catch((err) => {
              deleteProductImageFromFirebase(newFileName)
                .then(() => {
                  err.status = 422;
                  return next(err);
                });
            });
        });
    } else {
      Product.findOneAndUpdate({ _id: req.product._id },
        { $set: fields },
        { new: true, runValidators: true, omitUndefined: true, useFindAndModify: false })
        .then(productDoc => {
          if (!productDoc) {
            let error = new Error("Error updating the product");
            error.status = 500;
            throw error;
          } else {
            productDoc.createdAt = undefined;
            productDoc.updatedAt = undefined;
            productDoc.__v = undefined;
            return res.status(201).json(productDoc);
          }
        }).catch(err => {
          next(err);
        })
    }
  })
}


exports.getProduct = (req, res, next) => {
  req.product.createdAt = undefined;
  req.product.updatedAt = undefined;
  req.product.__v = undefined;
  res.status(200).json(req.product);
}

exports.deleteProduct = (req, res, next) => {
  let imageName = req.product.image.imageName;
  deleteProductImageFromFirebase(imageName)
    .then(() => {
      return Product.findOneAndDelete({ _id: req.product._id })
    })
    .then(() => {
      return res.status(200).json({
        message: `The product ${req.product._id} has been deleted`
      });
    })
    .catch((err) => {
      return next(err);
    })
}

exports.getAllProducts = (req, res, next) => {
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
    limit = 5;
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
    page = 1;
  }

  let resObj = {};
  Product.find()
    .select("-__v -createdAt -updatedAt")
    .sort({ _id: 'asc' })
    .limit(limit)
    .skip((page - 1) * limit)
    .then(products => {
      resObj.limit = limit;
      resObj.page = page;
      resObj.count = products.length;
      resObj.products = products;
      return Product.countDocuments();
    })
    .then(count => {
      resObj.totalProducts = count;
      res.status(200).json(resObj);
    })
    .catch(error => {
      error.status = 500;
      return next(error);
    });
}