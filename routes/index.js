function initiator(router, app) {
  let api_path = __basedir + "/routes/api";

  require(api_path + "/user.js")(router, app);
  require(api_path + "/addInfo.js")(router, app);
  require(api_path + "/keyword.js")(router, app);
  require(api_path + "/budget.js")(router, app);
}
module.exports = initiator;
