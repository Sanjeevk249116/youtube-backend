const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiError } = require("../utils/apiError");
const { UserModel } = require("../models/user.modal");
const { apiResponse } = require("../utils/apiResponse");

export const getUserChannelDetails = asyncHandler(async (req, res) => {
  const userName = req.params;
  if (!userName?.trim()) {
    throw new ApiError(400, "User name is missing");
  }

  const channerDetail = await UserModel.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptionModels",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptionModels",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscriberTo",
      },
    },
    {
        $addFields:{
            subscriberCount:{
                $size:{"$subscribers"}
            },
            channelToSubscribTo:{
                $size:{"$subscriberTo"}
            },{
                isSubscribed:{
                  $cond:{
                    if: {$in:[req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else:false
                  }
                }
            }
        }
    },{
        $project:{
            fullName:1,
            userName:1,
            subscriberCount:1,
            channelToSubscribTo:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1,
            email:1,
            createdAt:1
        }
    }
  ]);
  if(!channerDetail.length){
    throw new Error(400,"channel does not exist");
  }
  return res.status(200).
  json(new apiResponse(200,channerDetail[0]))
});
