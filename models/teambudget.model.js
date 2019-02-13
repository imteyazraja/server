const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const {PackageSchema} = require("./campaign.model");

const TeamSchema = new Schema(
  {
    city: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    bounce: {
      package: {type: PackageSchema}
    },
    hotdata: {
      package: {type: PackageSchema}
    },
    online: {
      package: {type: PackageSchema}
    },
    retention: {
      package: {type: PackageSchema}
    },
    revivalexp: {
      package: {type: PackageSchema}
    },
    super: {
      package: {type: PackageSchema}
    },
    supercat: {
      package: {type: PackageSchema}
    },
    corporates: {
      package: {type: PackageSchema}
    }
  },
  {strict: true, versionKey: false, timestamps: true}
);

module.exports = TeamBudget = mongoose.model("teambudgets", TeamSchema);
