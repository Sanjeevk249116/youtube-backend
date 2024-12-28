const express = require("express");
require("dotenv").config();

const { connection } = require("./src/config/connection");
const { app } = require("./src/app");

// Start the server.
app.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on port ${process.env.PORT || 8080}`);
  connection(); // Initialize the database connection.
});
