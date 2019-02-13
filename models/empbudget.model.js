const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const {PackageSchema} = require("./campaign.model");

const EmployeeSchema = new mongoose.Schema(
  {
    empcode: {type: String, required: true, trim: true, unique: true},
    empname: {type: String, required: true, trim: true},
    package: {type: PackageSchema}
  },
  {strict: true, versionKey: false, timestamps: true}
);
const EmployeeBudget = mongoose.model("empbudgets", EmployeeSchema);
module.exports = EmployeeBudget;
