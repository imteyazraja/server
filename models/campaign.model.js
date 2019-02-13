const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PackageSchema = new mongoose.Schema(
  {
    prempkg_ecs: {type: Number, trim: true},
    prempkg_nonecs: {type: Number, trim: true},
    prempkg_twoyr_per: {type: Number, trim: true},
    prempkg_disc_per: {type: Number, trim: true},
    prempkg_disc_eligib: {type: Number, trim: true},
    prempkg_threemon_nonecs: {type: Number, trim: true},
    prempkg_citymin_bdgt: {type: Number, trim: true},
    pkgvfl_ecs: {type: Number, trim: true},
    pkgvfl_nonecs: {type: Number, trim: true},
    pkgvfl_ecs_custom: {type: Number, trim: true},
    pkgvfl_nonecs_custom: {type: Number, trim: true},
    pkgvfl_existing_ecs_per: {type: Number, trim: true},
    pkgvfl_existing_nonecs_per: {type: Number, trim: true},
    pkgvfl_expiry_ecs: {type: Number, trim: true},
    pkgvfl_expiry_nonecs: {type: Number, trim: true},
    pkgexp_ecs: {type: Number, trim: true},
    pkgexp_nonecs: {type: Number, trim: true},
    pkgexp_twoyr_nonecs: {type: Number, trim: true},
    flxcat_ecs: {type: Number, trim: true},
    flxcat_nonecs: {type: Number, trim: true},
    flxcat_twoyr_per: {type: Number, trim: true}
  },
  {strict: true, versionKey: false}
);
exports.PackageSchema = PackageSchema;

const PDGSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    pdg_price: {type: Number, required: true}
  },
  {strict: true, versionKey: false}
);
exports.PDGSchema = PDGSchema;
