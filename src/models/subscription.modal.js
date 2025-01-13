const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
  },
  { timestamps: true }
);

const SubscriptionModel = mongoose.model(
  "SubscriptionModel",
  subscriptionSchema
);

module.exports = { SubscriptionModel };
