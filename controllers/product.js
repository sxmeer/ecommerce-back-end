const { Product, imageType } = require("../models/product");
const { storage } = require("../firebase");
const formidable = require("formidable");
const { v1: uuidv1 } = require('uuid');
const fs = require('fs');

const deleteProductImageFromFirebase = (fileName, operation = "creating") => {
  return storage.ref(process.env.FIREBASE_PRODUCT_IMAGES)
    .child(fileName).delete()
    .then(() => {
      throw new Error(`Error ${operation} product`);
    })
    .catch((err) => {
      err.data = { message: `Error ${operation} product` };
      throw err;
    })
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
          storage.ref(process.env.FIREBASE_PRODUCT_IMAGES)
            .child(newFileName)
            .getDownloadURL()
            .then(url => {
              let imageObj = { imageUrl: url, imageName: newFileName };
              fields.image = imageObj;
              let product = new Product(fields);
              return product.save();
            })
            .then(productDoc => {
              if (!productDoc) {
                deleteProductImageFromFirebase(newFileName)
                  .catch(err => {
                    err.status = 422;
                    return next(err)
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
                .catch(error => {
                  err.data = error.data;
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
          storage.ref(process.env.FIREBASE_PRODUCT_IMAGES)
            .child(newFileName)
            .getDownloadURL()
            .then(url => {
              let imageObj = { imageUrl: url, imageName: newFileName };
              fields.image = imageObj;
              return Product.findOneAndUpdate({ _id: req.product._id },
                { $set: fields },
                { new: true, runValidators: true, omitUndefined: true, useFindAndModify: false });
            })
            .then(productDoc => {
              if (!productDoc) {
                deleteProductImageFromFirebase(newFileName, "updating")
                  .catch(err => {
                    err.status = 422;
                    return next(err)
                  });
              } else {
                productDoc.createdAt = undefined;
                productDoc.updatedAt = undefined;
                productDoc.__v = undefined;
                return res.status(201).json(productDoc);
              }
            })
            .catch((err) => {
              deleteProductImageFromFirebase(newFileName, "updating")
                .catch(error => {
                  err.data = error.data;
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