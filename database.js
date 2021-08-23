const mongoose = require('mongoose');

mongoose.connect(process.env.DB_PATH, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("DB Connected successfully");
}).catch((err) => {
  console.log("Error connecting db ", err);
})