const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const {PackageSchema} = require("./campaign.model");

const CampaignSchema = new mongoose.Schema(
  {
    city: {type: String, required: true, trim: true, unique: true},
    package: {type: PackageSchema}
  },
  {strict: true, versionKey: false, timestamps: true}
);
const CityBudget = mongoose.model("citybudgets", CampaignSchema);
module.exports = CityBudget;
