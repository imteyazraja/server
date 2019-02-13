const {isEmpty, trimObj, capitalize} = require(__basedir + "/utility/helper");

const asyncMiddleware = require(__basedir + "/utility/async");

const ConnCity = require(__basedir + "/config/conncity");
const conf = require(__basedir + "/config/keys");
const dbcon = require(__basedir + "/config/db");
const moment = require("moment");

const _ = require("lodash");

exports.cityData = asyncMiddleware(async function(req, res) {
  req.body = trimObj(req.body);

  if (isEmpty(req.body.source)) {
    // It will have tier_wise , zone_wise
    return res.status(400).json({error: 1, msg: "source is blank."});
  }

  if (isEmpty(req.body.type)) {
    // tier2 , tier3, zone_mum and so on
    return res.status(400).json({error: 1, msg: "type is blank."});
  }

  req.body.data_city = "remote"; // Running query always on remote server

  const data_city = req.body.data_city;
  const source = req.body.source;
  const type = req.body.type;

  let valid_src_arr = ["tier_wise", "zone_wise"];

  if (!_.includes(valid_src_arr, source)) {
    return res.status(400).json({
      error: 1,
      msg: "Invalid source passed. Pls pass tier_wise/zone_wise."
    });
  }
  req.body.city = "remote";
  let resp_obj = {};
  resp_obj["error"] = {};
  let conn_city_obj = new ConnCity();
  const conninfo = await conn_city_obj.getConnCity(req.body);

  if (conninfo.err === 0) {
    const conn_city = conninfo.conn_city;
    const conn_local = conf["local"][conn_city];

    let cityData = {};

    if (source == "tier_wise") {
      let tier = 0;
      if (type === "tier2") {
        tier = 2;
      } else if (type === "tier3") {
        tier = 3;
      }
      if (tier > 0) {
        cityData = await dbcon.db_query({
          conn: conn_local,
          query:
            "SELECT ct_name FROM tbl_city_master WHERE tier = '" +
            tier +
            "' AND display_flag = 1 AND type_flag = 0 AND ct_name NOT IN ('mumbai','delhi','kolkata','bangalore','chennai','pune','hyderabad','ahmedabad','chandigarh','coimbatore','jaipur') LIMIT 10"
        });
      }
    } else if (source == "zone_wise") {
      let main_zone = "";
      switch (type) {
        case "zone_mum":
          main_zone = "mumbai";
          break;
        case "zone_del":
          main_zone = "delhi";
          break;
        case "zone_kol":
          main_zone = "kolkata";
          break;
        case "zone_blr":
          main_zone = "bangalore";
          break;
        case "zone_chn":
          main_zone = "chennai";
          break;
        case "zone_pun":
          main_zone = "pune";
          break;
        case "zone_hyd":
          main_zone = "hyderabad";
          break;
        case "zone_ahm":
          main_zone = "ahmedabad";
          break;
        case "zone_cbe":
          main_zone = "coimbatore";
          break;
        case "zone_jpr":
          main_zone = "jaipur";
          break;
        case "zone_chg":
          main_zone = "chandigarh";
          break;
      }
      if (!isEmpty(main_zone)) {
        cityData = await dbcon.db_query({
          conn: conn_local,
          query:
            "SELECT Cities as ct_name FROM tbl_zone_cities WHERE main_zone ='" +
            main_zone +
            "' AND Cities NOT IN ('mumbai','delhi','kolkata','bangalore','chennai','pune','hyderabad','ahmedabad','chandigarh','coimbatore','jaipur') LIMIT 10"
        });
      }
    }

    if (Object.keys(cityData).length > 0) {
      let data_arr = [];
      for (let i = 0; i < Object.keys(cityData).length; i++) {
        data_arr.push(cityData[i].ct_name);
      }
      resp_obj["error"] = 0;
      resp_obj["msg"] = "Data Found";
      resp_obj["data"] = data_arr;
      return res.status(200).json(resp_obj);
    } else {
      resp_obj["error"] = 1;
      resp_obj["msg"] = "Data Not Found";
      return res.status(200).json(resp_obj);
    }
  } else {
    return res
      .status(500)
      .json({error: 1, msg: "Not able to identify conn_city"});
  }
});

exports.cityAutoSuggest = asyncMiddleware(async function(req, res) {
  req.body = trimObj(req.body);

  if (isEmpty(req.body.srchcity)) {
    // It will have tier_wise , zone_wise
    return res.status(400).json({error: 1, msg: "srchcity is blank."});
  }

  req.body.data_city = "remote"; // Running query always on remote server

  const data_city = req.body.data_city;
  const srchcity = req.body.srchcity;

  let resp_obj = {};
  let conn_city_obj = new ConnCity();
  const conninfo = await conn_city_obj.getConnCity(req.body);
  if (conninfo.err === 0) {
    const conn_city = conninfo.conn_city;
    const conn_local = conf["local"][conn_city];

    const cityData = await dbcon.db_query({
      conn: conn_local,
      query:
        "SELECT DISTINCT city FROM tbl_business_uploadrates WHERE city LIKE '" +
        srchcity +
        "%' LIMIT 10"
    });

    if (Object.keys(cityData).length > 0) {
      let data_arr = [];
      for (let i = 0; i < Object.keys(cityData).length; i++) {
        let cityval = capitalize(cityData[i].city);
        data_arr.push(cityval);
      }
      resp_obj["errorcode"] = 0;
      resp_obj["errormsg"] = "Data Found";
      resp_obj["data"] = data_arr;
      return res.status(200).json(resp_obj);
    } else {
      resp_obj["errorcode"] = 1;
      resp_obj["errormsg"] = "Data Not Found";
      return res.status(200).json(resp_obj);
    }
  } else {
    return res
      .status(500)
      .json({error: 1, msg: "Not able to identify conn_city"});
  }
});
