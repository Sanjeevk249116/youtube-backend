const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiError } = require("../utils/apiError");
const { UserModel } = require("../models/user.modal");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const { apiResponse } = require("../utils/apiResponse");

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
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

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
    userName: userName?.toLowerCase(),
  });

  const createdUser = UserModel?.findOne(user?._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Internal serval error");
  }

  return res
    .status(200)
    .json(new apiResponse(200, createdUser, "user registration successfully"));
});

module.exports = { registerUser };
