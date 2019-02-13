const {isEmpty} = require(__basedir + "/utility/helper");

module.exports = function validateKeywordInput(data) {
  let errors = "";

  data.abbr = !isEmpty(data.abbreviation) ? data.abbreviation.toString() : "";
  data.desc = !isEmpty(data.description) ? data.description.toString() : "";
  data.camp = !isEmpty(data.campaign_name) ? data.campaign_name.toString() : "";

  let tmp_arr = [];

  if (isEmpty(data.abbr)) {
    tmp_arr.push("abbreviation");
  }
  if (isEmpty(data.desc)) {
    tmp_arr.push("description");
  }
  if (isEmpty(data.camp)) {
    tmp_arr.push("campaign_name");
  }
  if (tmp_arr.length > 0) {
    errors = tmp_arr.join(", ");
    errors += " is blank.";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
