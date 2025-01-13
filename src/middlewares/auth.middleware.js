const { asyncHandler } = require("../utils/asyncHandler");
const { UserModel } = require("../models/user.modal");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJwtUser = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.header("auth-token");

    if (!token) {
      throw new Error(401, "Unauthorized user request");
    }
    if (!process.env.REFRESH_TOKEN_SECRET) {
      console.error("Missing REFRESH_TOKEN_SECRET in environment variables");
    }
   
    const decodedUserToken = await jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await UserModel.findById(decodedUserToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new Error(401, "Invalid access token for this user");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    throw new Error(401, error?.message || "Invalid access token");
  }
});

module.exports = { verifyJwtUser };
