const Mongoose = require("mongoose");
require("dotenv").config();

const connection = async () => {
  try {
    const connectionDB = await Mongoose.connect(process.env.MONGOSHURL);
  } catch (error) {
    console.log("error in connection", error);
  }
};

module.exports = { connection };
