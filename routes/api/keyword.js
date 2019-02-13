function initiator(router, app) {
  app.use("/api/keyword/", router);

  const keywordCntlr = require(__basedir + "/controllers/keyword.controller");

  router.get("/keywordtest", (req, res) => res.json({msg: "keyword Works"}));
  router.post("/updatekeyword", keywordCntlr.updateKeyword);
  router.post("/fetchkeyword", keywordCntlr.fetchKeyword);
}
module.exports = initiator;
