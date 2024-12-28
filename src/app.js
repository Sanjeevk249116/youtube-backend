const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { router } = require("./routes/user.routes");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data.
app.use(express.static("public")); // Serve static files.
app.use(cookieParser()); // Parse cookies.
app.use(
  cors({
    origin: "*",
  })
);

app.use("/users", router);

module.exports = { app };
