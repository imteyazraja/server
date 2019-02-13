function initiator(router, app) {
  app.use("/api/addInfo/", router);

  const addInfoCntlr = require(__basedir + "/controllers/addInfo.controller");

  router.get("/addinfotest", (req, res) => res.json({msg: "addInfo Works"}));
  router.post("/citydata", addInfoCntlr.cityData);
  router.post("/cityauto", addInfoCntlr.cityAutoSuggest);
}
module.exports = initiator;
