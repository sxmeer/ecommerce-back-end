require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

//connecting db
require("./database");

// importing routes
const authRouter = require("./routes/auth");
const cartRouter = require("./routes/cart");
const orderRouter = require("./routes/order");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/cart", cartRouter);
app.use("/order", orderRouter);
app.use("/product", productRouter);
app.use("/user", userRouter);
app.use("/payment", paymentRouter);


app.use((error, req, res, next) => {
  console.log(error);
  const { status, message, data } = error;
  res.status(status || 500).json({ message, data });
});


app.listen(process.env.PORT || 8000, () => {
  console.log(`app is listening on port ${process.env.SERVER_PORT}`);
})
