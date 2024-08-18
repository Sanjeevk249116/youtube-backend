const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String,
      required: true,
    },
    thumbNail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    decription: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    view: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModal",
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongoosePaginate);

export const VideoMadel = mongoose.model("VideoMadel", videoSchema);
