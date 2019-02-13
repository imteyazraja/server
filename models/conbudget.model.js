const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const {PackageSchema} = require("./campaign.model");

const ContractSchema = new mongoose.Schema(
  {
    parentid: {type: String, required: true, trim: true, unique: true},
    package: {type: PackageSchema}
  },
  {strict: true, versionKey: false, timestamps: true}
);
module.exports = ContractBudget = mongoose.model(
  "contractbudgets",
  ContractSchema
);
