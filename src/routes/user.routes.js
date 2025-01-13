const express = require("express");
const { verifyJwtUser } = require("../middlewares/auth.middleware.js");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  profileDetails,
  accountUpdateAccount,
  updateUserAvatar,
} = require("../controllers/user.controller");
const { upload } = require("../middlewares/multer.middleware");

router.post(
  "/create/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.post("/create/login", loginUser);

//secure router
router.post("/create/logout", verifyJwtUser, logOutUser);
router.post("/refresh-token", verifyJwtUser, refreshAccessToken);
router.post("/update/password", verifyJwtUser, changeCurrentPassword);
router.post("/update/account", verifyJwtUser, accountUpdateAccount);
router.post(
  "/update/avatar",
  upload.single("avatar"),
  verifyJwtUser,
  updateUserAvatar
);
router.get("/read/profile", verifyJwtUser, profileDetails);

module.exports = { router };
