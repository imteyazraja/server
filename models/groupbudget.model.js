const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const {PackageSchema} = require("./campaign.model");

const GroupSchema = new Schema(
  {
    city: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    tme: {
      package: {type: PackageSchema}
    },
    me: {
      package: {type: PackageSchema}
    },
    jda: {
      package: {type: PackageSchema}
    }
  },
  {strict: true, versionKey: false, timestamps: true}
);

module.exports = GroupBudget = mongoose.model("groupbudgets", GroupSchema);
