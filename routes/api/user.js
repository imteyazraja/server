const passport = require("passport");
function initiator(router, app) {
  app.use("/api/user/", router);

  const userCntlr = require(__basedir + "/controllers/user.controller");

  router.get("/usertest", (req, res) => res.json({msg: "User Works"}));
  router.post("/fetchUser", userCntlr.fetchUser);
  router.post("/registerUser", userCntlr.registerUser);
  router.post(
    "/currentUser",
    passport.authenticate("jwt", {
      session: false,
      failureRedirect: "/api/user/failurejson"
    }),
    userCntlr.currentUser
  );
  router.get("/failurejson", (req, res) =>
    res.json({error: 1, msg: "Authentication Fail. Please Relogin."})
  );
}
module.exports = initiator;
