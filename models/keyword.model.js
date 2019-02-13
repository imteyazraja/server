const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const KeywordSchema = new Schema(
  {
    abbreviation: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    campaign_name: {
      type: String,
      required: true
    },
    active_flag: {
      type: Number,
      default: 1
    }
  },
  {strict: true, versionKey: false, timestamps: true}
);

module.exports = Keyword = mongoose.model("keywords", KeywordSchema);
