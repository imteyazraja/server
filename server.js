global.__basedir = __dirname;
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const app = express();

const router = express.Router();

let logger = require(__basedir + "/config/winston");
let morgan = require("morgan");
morgan.token("date", function() {
  return new Date().toString();
});
app.use(morgan("combined"));
//app.use(morgan("combined", {stream: winston.stream}));

// Body parser middleware

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

require("./routes/index.js")(router, app);

// Connect to MongoDB
mongoose
  .connect(
    db,
    {useNewUrlParser: true, useCreateIndex: true}
  )
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.log("Problem in connecting Mongo DB Server.");
    process.exit();
  });

// Passport middleware
app.use(passport.initialize());

// Passport Config
require("./config/passport")(passport);

process
  .on("unhandledRejection", (reason, p) => {
    //console.log(reason, "Unhandled Rejection at Promise", p);
    logger.error("unhandledRejection", reason);
  })
  .on("uncaughtException", err => {
    //console.error(err, "Uncaught Exception thrown");
    logger.error("Uncaught Exception thrown !!!", err);
    //process.exit(1);
  });

const port = process.env.PORT || 7777;

var serverObj = app.listen(port);
serverObj.timeout = 9000;
console.log(`Server running on port ${port}`);
