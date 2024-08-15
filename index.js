const mongoose = require("mongoose");
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { connection } = require("./src/config/connection");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.listen(process.env.PORT, () => {
  connection();
});
