const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiError } = require("../utils/apiError");
const { UserModel } = require("../models/user.modal");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const { apiResponse } = require("../utils/apiResponse");
const jwt = require("jsonwebtoken");

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

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incommingRefreshToken =
      req.cookies?.refreshToken || res.header("auth-token");

    if (!incommingRefreshToken) {
      throw new Error(401, "Unauthorized person");
    }

    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await UserModel.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh token");
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new Error(401, "expire token");
    }
    const { acceshToken, refershToken } = await refershAndGenerateToken(
      decodedToken?._id
    );
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", acceshToken, options)
      .cookie("refreshToken", refershToken, options)
      .json(new apiResponse(200, user));
  } catch (error) {
    throw new Error(401, "Unauthorized person or token expire");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { password, oldPassword } = req.body;
  const user = await UserModel.findById(req.user?._id);

  const checkOldPassword = await user.isPasswordCorrect(oldPassword);
  if (!checkOldPassword) {
    throw new ApiError(400, "Invalid old Password");
  }

  user.password = password;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new apiResponse(200, "Password change successfully"));
});

const profileDetails = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new Error(400, "Profile does not exist");
  }

  return res.status(200).json(new apiResponse(200, user));
});

const accountUpdateAccount = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (fullName === "" || email === "") {
    throw new ApiError(400, "All field are required");
  }

  const user = await UserModel.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        //user to update database
        fullName,
        email,
      },
    },
    {
      new: true, //use to return update data
    }
  ).select("-password -refreshToken");

  return res.status(200).json(new apiResponse(200, user));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatarUpdated = await uploadOnCloudinary(avatarLocalPath);

  if (!avatarUpdated?.url) {
    throw new ApiError(500, "Failed to upload image");
  }

  const user = await UserModel.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatarUpdated.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new apiResponse(200, user, "Profile Update successfully"));
});

module.exports = {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  profileDetails,
  accountUpdateAccount,
  updateUserAvatar
};
