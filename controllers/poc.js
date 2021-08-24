const { storage } = require("../firebase");
const formidable = require("formidable");
const { v1: uuidv1 } = require('uuid');
const fs = require('fs');

const uploadPOC = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      err.status = 422;
      return next(err);
    }
    //handling file
    if (file.photo) {
      if (file.photo.size > (2 * 1024 * 1024)) {
        let error = new Error("File size exceeded 2 MB");
        error.status = 422;
        return next(error);
      }
      let newFileName = `${uuidv1()}-${file.photo.name}`;
      let blobObject = fs.readFileSync(file.photo.path);
      const uploadTask = storage.ref(`images/${newFileName}`).put(blobObject, { contentType: file.photo.type }); uploadTask.on("state_changed", (snapshot) => { },
        (error) => { return next(error); },
        () => {
          //complete function
          storage.ref("images")
            .child(newFileName)
            .getDownloadURL()
            .then(url => {
              return res.status(201).json({ url })
            });
        });
    } else {
      let error = new Error("Please provide image");
      error.status = 400;
      return next(error);
    }
  })
}