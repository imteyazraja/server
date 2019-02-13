function initiator(router, app) {
  app.use("/api/budget/", router);

  const BudgetClass = require(__basedir + "/controllers/budget.controller");
  const budgetClassObj = new BudgetClass();

  router.get("/budgettest", (req, res) => res.json({msg: "budget Works"}));

  router.post("/getcitybudget", (req, res) => {
    budgetClassObj.getCityBudget(req, res);
  });
  router.post("/setcitybudget", (req, res) => {
    budgetClassObj.setCityBudget(req, res);
  });

  router.post("/bulkinsertctbudget", (req, res) => {
    budgetClassObj.bulkInsertCityBudget(req, res);
  });

  router.post("/getgroupbudget", (req, res) => {
    budgetClassObj.getGroupBudget(req, res);
  });

  router.post("/setgroupbudget", (req, res) => {
    budgetClassObj.setGroupBudget(req, res);
  });

  router.post("/getteambudget", (req, res) => {
    budgetClassObj.getTeamBudget(req, res);
  });

  router.post("/setteambudget", (req, res) => {
    budgetClassObj.setTeamBudget(req, res);
  });

  router.post("/getempbudget", (req, res) => {
    budgetClassObj.getEmployeeBudget(req, res);
  });

  router.post("/setempbudget", (req, res) => {
    budgetClassObj.setEmployeeBudget(req, res);
  });

  router.post("/getconbudget", (req, res) => {
    budgetClassObj.getContractBudget(req, res);
  });

  router.post("/setconbudget", (req, res) => {
    budgetClassObj.setContractBudget(req, res);
  });

  router.post("/getcampaignbudget", (req, res) => {
    budgetClassObj.getCampaignBudget(req, res);
  });

  router.post("/resetpkgbudget", (req, res) => {
    budgetClassObj.resetPackageBudget(req, res);
  });
}
module.exports = initiator;
