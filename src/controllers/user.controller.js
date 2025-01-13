const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiError } = require("../utils/apiError");
const { UserModel } = require("../models/user.modal");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const { apiResponse } = require("../utils/apiResponse");

const refershAndGenerateToken = async (UserId) => {
  try {
    const user = await UserModel.findOne(UserId);
    const refershToken = user.generateRefreshToken();
    const acceshToken = user.generateAccessToken();
    user.refreshToken = refershToken;
    user.save({ validateBeforeSave: false });
    return { refershToken, acceshToken };
  } catch (error) {
    throw new ApiError(500, "Internal server error while generating token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, fullName, password } = req.body;
  if (
    [userName, email, fullName, password]?.some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field are required");
  }
  const allReadyExists = await UserModel?.findOne({
    $or: [{ userName: userName }, { email: email }],
  });

  if (allReadyExists) {
    throw new ApiError(409, "User is allready register");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath =
    req.files?.coverImage?.length > 0 ? req.files?.coverImage[0]?.path : "";

  if (!avatarLocalPath) {
    throw new ApiError(400, "Files is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) throw new ApiError(400, "Failed to upload file");

  const user = await UserModel.create({
    fullName,
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName?.toLowerCase(),
  });

  const createdUser = await UserModel?.findOne(user?._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Internal serval error");
  }

  return res
    .status(200)
    .json(new apiResponse(200, createdUser, "user registration successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, userName } = req.body;

  if (userName === "" || email === "") {
    throw new ApiError(400, "userName and password are required");
  }
  const existUser = await UserModel.findOne({ $or: [{ userName }, { email }] });

  if (!existUser) {
    throw new ApiError(400, "User does not exist");
  }

  const isPasswordValid = await existUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  const { acceshToken, refershToken } = await refershAndGenerateToken(
    existUser?._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", acceshToken, options)
    .cookie("refreshToken", refershToken, options)
    .json(new apiResponse(200, refershToken));
});

const logOutUser = asyncHandler(async (req, res) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user?._id,
    { $unset: { refreshToken: "" } }, // Explicitly remove the field
    { new: true } // Return the updated document
  );
  console.log("user109", user);
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, "user logout successfully"));
});

module.exports = { registerUser, loginUser, logOutUser };
