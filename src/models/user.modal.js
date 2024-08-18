const mongoose = require("mongoose");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const userScehma = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VideoMadel",
      },
    ],
    password: {
      type: true,
      required: [true, "Password is required"],
    },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

userScehma.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hash(thi.password, 8);
  next();
});

userScehma.methods.isPasswordCorrect = async function (password) {
  await bcrypt.compare(password, this.password);
};

userScehma.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userScehma.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFESH_TOKEN_EXPRERY }
  );
};

export const UserModal = mongoose.model("UserModal", userScehma);
