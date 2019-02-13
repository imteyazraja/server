const {isEmpty, trimObj} = require(__basedir + "/utility/helper");

const asyncMiddleware = require(__basedir + "/utility/async");

// Load Input Validation
const validateKeywordInput = require(__basedir + "/auth/keyword_validation");

// Load User model
const Keyword = require(__basedir + "/models/keyword.model");

// @route   POST api/keyword/updatekeyword

exports.updateKeyword = asyncMiddleware(async function(req, res) {
  req.body = trimObj(req.body);
  const {errors, isValid} = validateKeywordInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json({error: 1, msg: errors});
  }

  // Assigning Params
  const abbreviation = req.body.abbreviation;
  const description = req.body.description;
  const campaign_name = req.body.campaign_name;

  let active_flag = 1;
  if (typeof req.body.active_flag !== "undefined") {
    active_flag = req.body.active_flag;
  }

  let resp_obj = {};
  const createKeyword = await Keyword.findOneAndUpdate(
    {abbreviation: abbreviation},
    {
      $set: {
        description: description,
        campaign_name: campaign_name,
        active_flag: active_flag
      }
    },
    {new: true, upsert: true, runValidators: true}
  );
  if (Object.keys(createKeyword).length > 0) {
    resp_obj["error"] = 0;
    resp_obj["msg"] = "Keyword Created";
    return res.status(200).json(resp_obj);
  }
  resp_obj["error"] = 1;
  resp_obj["msg"] = "There is a problem in creating keyword.";
  return res.status(500).json(resp_obj);
});

// @route   POST api/keyword/fetchkeyword
exports.fetchKeyword = asyncMiddleware(async function(req, res) {
  req.body = trimObj(req.body);
  const keywordData = await Keyword.find({}, {_id: 0, abbreviation: 1});
  let keywords_arr = [];
  if (keywordData && Object.keys(keywordData).length > 0) {
    for (let prop in keywordData) {
      if (keywordData.hasOwnProperty(prop)) {
        keywords_arr.push(keywordData[prop].abbreviation);
      }
    }
  }
  let resp_obj = {};
  if (keywords_arr.length > 0) {
    resp_obj["error"] = 0;
    resp_obj["msg"] = "Keyword Found";
    resp_obj["data"] = keywords_arr;
    return res.status(200).json(resp_obj);
  }
  resp_obj["error"] = 1;
  resp_obj["msg"] = "No Keyword Found.";
  return res.status(200).json(resp_obj);
});
