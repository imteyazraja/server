const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema(
  {
    ucode: {
      type: String,
      required: true,
      unique: true
    },
    uname: {
      type: String,
      required: true
    },
    active_flag: {
      type: Number,
      default: 1
    }
  },
  {strict: true, versionKey: false}
);

module.exports = User = mongoose.model("users", UserSchema);
