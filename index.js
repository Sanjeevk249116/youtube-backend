const mongoose = require("mongoose");
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connection } = require("./src/config/connection");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("hello kanan,how are you?");
});

app.use(
  cors({
    origin: "*",
  })
);

app.listen(process.env.PORT || 8080, () => {
  connection();
});
