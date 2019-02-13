const {isEmpty} = require(__basedir + "/utility/helper");

module.exports.validateLoginInput = function validateLoginInput(data) {
  let errors = "";
  data.ucode = !isEmpty(data.ucode) ? data.ucode.toString() : "";
  let tmp_arr = [];

  if (isEmpty(data.ucode)) {
    tmp_arr.push("ucode");
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
module.exports.validateRegisterInput = function validateRegisterInput(data) {
  let errors = "";
  data.ucode = !isEmpty(data.ucode) ? data.ucode.toString() : "";
  data.uname = !isEmpty(data.uname) ? data.uname.toString() : "";
  let tmp_arr = [];

  if (isEmpty(data.ucode)) {
    tmp_arr.push("ucode");
  }
  if (isEmpty(data.uname)) {
    tmp_arr.push("uname");
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
