require('dotenv').config();
const express = require('express');
const app = express();

const cors = require('cors');

//connecting db
require("./database");

app.use(cors());
app.use(express.json());


app.use((error, req, res, next) => {
  const { status, message, data } = error;
  res.status(status || 500).json({ message, data });
});


app.listen(process.env.SERVER_PORT, () => {
  console.log(`app is listening on port ${process.env.SERVER_PORT}`);
})