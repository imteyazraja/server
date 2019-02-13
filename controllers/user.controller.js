const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const passport = require("passport");
const moment = require("moment");

const keys = require(__basedir + "/config/keys");
const {trimObj} = require(__basedir + "/utility/helper");
const asyncMiddleware = require(__basedir + "/utility/async");
//Load Input Validation

const {validateLoginInput, validateRegisterInput} = require(__basedir +
  "/auth/user_validation");

// Load User model
const User = require(__basedir + "/models/user.model");

// @route   GET api/users/login
// @desc    Login User / Returning JWT Token
// @access  Public

exports.fetchUser = asyncMiddleware(async function(req, res) {
  //Removing Spaces
  req.body = trimObj(req.body);
  const {errors, isValid} = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json({error: 1, msg: errors});
  }
  const ucode = req.body.ucode;

  // Find user by ucode
  const user = await User.findOne({ucode: ucode});
  if (!user) {
    return res.status(404).json({error: 1, msg: "User not found"});
  }

  // Create JWT Payload
  const payload = {id: user.id, ucode: user.ucode};

  // Sign Token
  jwt.sign(payload, keys.secretOrKey, {expiresIn: 3600}, (err, token) => {
    res.json({
      error: 0,
      message: "Success",
      token: "Bearer " + token
    });
  });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private

exports.currentUser = asyncMiddleware(async function(req, res) {
  res.json({
    id: req.user.id,
    ucode: req.user.ucode
  });
});

// @route   GET api/users/register
// @desc    Register user
// @access  Public
exports.registerUser = asyncMiddleware(async function(req, res) {
  req.body = trimObj(req.body);
  const {errors, isValid} = validateRegisterInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json({error: 1, msg: errors});
  }
  // Assigning Params
  const ucode = req.body.ucode;
  const uname = req.body.uname;

  let active_flag = 1;
  if (typeof req.body.active_flag !== "undefined") {
    active_flag = req.body.active_flag;
  }

  // Find user by ucode
  const existingUser = await User.findOne({ucode: ucode, active_flag: 1});
  if (existingUser) {
    return res
      .status(404)
      .json({error: 1, msg: "Employee Code already exists"});
  }
  let resp_obj = {};
  const createUser = await User.findOneAndUpdate(
    {ucode: ucode},
    {
      $set: {
        uname: uname,
        active_flag: active_flag
      }
    },
    {new: true, upsert: true, runValidators: true}
  );
  if (Object.keys(createUser).length > 0) {
    resp_obj["error"] = 0;
    resp_obj["msg"] = "User Created";
    return res.status(200).json(resp_obj);
  }
  resp_obj["error"] = 1;
  resp_obj["msg"] = "There is a problem in creating user.";
  return res.status(500).json(resp_obj);

  /*
const newUser = new User({
    ucode: ucode,
    uname: uname,
    active_flag : active_flag
  });

  newUser
    .save()
    .then(user => res.json(user))
    .catch(err => console.log(err));*/
});
