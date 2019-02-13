const {isEmpty, trimObj} = require(__basedir + "/utility/helper");
const {CAMPAIGNLIST, GROUPLIST, TEAMLIST} = require(__basedir +
  "/utility/constants");
const asyncMiddleware = require(__basedir + "/utility/async");

const {
  validateCityData,
  validateGroupData,
  validateTeamData,
  validateEmployeeData,
  validateContractData,
  validateCampaignRequest
} = require(__basedir + "/auth/budget_validation");

const cityBudgetObj = require(__basedir + "/models/citybudget.model");
const groupBudgetObj = require(__basedir + "/models/groupbudget.model");
const teamBudgetObj = require(__basedir + "/models/teambudget.model");
const empBudgetObj = require(__basedir + "/models/empbudget.model");
const conBudgetObj = require(__basedir + "/models/conbudget.model");
const keywordObj = require(__basedir + "/models/keyword.model");

class BudgetClass {
  async getCampaignBudget(req, res) {
    let resp_obj = {};
    let debug = 0;
    let debug_res = {};
    if (!isEmpty(req.body.debug)) {
      debug = 1;
      debug_res["kwd"] = {};
      debug_res["kwd_cnt"] = 0;
      debug_res["con"] = {};
      debug_res["con_tkn"] = {};
      debug_res["emp"] = {};
      debug_res["emp_tkn"] = {};
      debug_res["tm"] = {};
      debug_res["tm_tkn"] = {};
      debug_res["grp"] = {};
      debug_res["grp_tkn"] = {};
      debug_res["ct"] = {};
      debug_res["ct_tkn"] = {};
      debug_res["kwd_rem"] = {};
    }

    try {
      req.body = trimObj(req.body);
      const {errors, isValid} = validateCampaignRequest(req.body);

      // Check Validation
      if (!isValid) {
        return res.status(400).json({error: 1, msg: errors});
      }

      // Assigning Params
      const parentid = req.body.parentid.toUpperCase();
      const empcode = req.body.empcode;
      const team_type = req.body.team_type.toLowerCase();
      const group_type = req.body.group_type.toLowerCase();
      const city = req.body.city.toLowerCase();

      const keywordData = await keywordObj.find({}, {_id: 0, abbreviation: 1});

      req.return = "data"; // assign this variable to get data in response from below promise
      const conBudgetData = await this.getContractBudget(req, res);

      const empBudgetData = await this.getEmployeeBudget(req, res);

      const teamBudgetData = await this.getTeamBudget(req, res);

      const groupBudgetData = await this.getGroupBudget(req, res);

      const cityBudgetData = await this.getCityBudget(req, res);

      Promise.all([
        keywordData,
        conBudgetData,
        empBudgetData,
        teamBudgetData,
        groupBudgetData,
        cityBudgetData
      ])
        .then(result => {
          let keywordRes = result[0];

          let empBudgetRes = result[2];
          let teamBudgetRes = result[3];
          let groupBudgetRes = result[4];
          let cityBudgetRes = result[5];

          let keywords_arr = [];
          if (keywordRes && Object.keys(keywordRes).length > 0) {
            for (let prop in keywordRes) {
              if (keywordRes.hasOwnProperty(prop)) {
                keywords_arr.push(keywordRes[prop].abbreviation);
              }
            }
          }

          if (debug) {
            debug_res["kwd"] = keywords_arr;
            debug_res["kwd_cnt"] = keywords_arr.length;
          }

          if (keywords_arr.length > 0) {
            let condata = result[1];
            if (debug) {
              debug_res["con"] = condata;
            }
            if (condata && Object.keys(condata).length > 0) {
              CAMPAIGNLIST.forEach(function(camp_name, key) {
                if (typeof condata[camp_name] !== "undefined") {
                  let tmp_con_obj = {};
                  tmp_con_obj = JSON.stringify(condata[camp_name]);
                  tmp_con_obj = JSON.parse(tmp_con_obj);

                  for (let conkey in tmp_con_obj) {
                    if (keywords_arr.includes(conkey)) {
                      resp_obj[conkey] = tmp_con_obj[conkey];

                      let conidx = keywords_arr.indexOf(conkey);
                      if (conidx > -1) {
                        keywords_arr.splice(conidx, 1);
                      }
                      if (debug) {
                        debug_res["con_tkn"][conkey] = tmp_con_obj[conkey];
                      }
                    }
                  }
                }
              });
            }
            console.log(resp_obj);
            console.log("keyword after contract budget : " + keywords_arr);
            if (keywords_arr.length > 0) {
              let empdata = result[2];
              if (debug) {
                debug_res["emp"] = empdata;
              }
              if (empdata && Object.keys(empdata).length > 0) {
                CAMPAIGNLIST.forEach(function(camp_name, key) {
                  if (typeof empdata[camp_name] !== "undefined") {
                    let tmp_emp_obj = {};
                    tmp_emp_obj = JSON.stringify(empdata[camp_name]);
                    tmp_emp_obj = JSON.parse(tmp_emp_obj);

                    for (let empkey in tmp_emp_obj) {
                      if (keywords_arr.includes(empkey)) {
                        resp_obj[empkey] = tmp_emp_obj[empkey];

                        let empidx = keywords_arr.indexOf(empkey);
                        if (empidx > -1) {
                          keywords_arr.splice(empidx, 1);
                        }

                        if (debug) {
                          debug_res["emp_tkn"][empkey] = tmp_emp_obj[empkey];
                        }
                      }
                    }
                  }
                });
              }
            }
            console.log(resp_obj);
            console.log("keyword after employee budget : " + keywords_arr);
            if (keywords_arr.length > 0) {
              let teamdata = result[3];
              if (debug) {
                debug_res["tm"] = teamdata;
              }
              if (teamdata && Object.keys(teamdata).length > 0) {
                if (!isEmpty(teamdata[team_type])) {
                  CAMPAIGNLIST.forEach(function(camp_name, key) {
                    if (typeof teamdata[team_type][camp_name] !== "undefined") {
                      let tmp_team_obj = {};
                      tmp_team_obj = JSON.stringify(
                        teamdata[team_type][camp_name]
                      );
                      tmp_team_obj = JSON.parse(tmp_team_obj);

                      for (let teamkey in tmp_team_obj) {
                        if (keywords_arr.includes(teamkey)) {
                          resp_obj[teamkey] = tmp_team_obj[teamkey];
                          let tmidx = keywords_arr.indexOf(teamkey);
                          if (tmidx > -1) {
                            keywords_arr.splice(tmidx, 1);
                          }
                          if (debug) {
                            debug_res["tm_tkn"][teamkey] =
                              tmp_team_obj[teamkey];
                          }
                        }
                      }
                    }
                  });
                }
              }
            }
            console.log(resp_obj);
            console.log("keyword after team budget : " + keywords_arr);
            if (keywords_arr.length > 0) {
              let groupdata = result[4];
              if (debug) {
                debug_res["grp"] = groupdata;
              }
              if (groupdata && Object.keys(groupdata).length > 0) {
                if (!isEmpty(groupdata[group_type])) {
                  CAMPAIGNLIST.forEach(function(camp_name, key) {
                    if (
                      typeof groupdata[group_type][camp_name] !== "undefined"
                    ) {
                      let tmp_group_obj = {};
                      tmp_group_obj = JSON.stringify(
                        groupdata[group_type][camp_name]
                      );
                      tmp_group_obj = JSON.parse(tmp_group_obj);

                      for (let groupkey in tmp_group_obj) {
                        if (keywords_arr.includes(groupkey)) {
                          resp_obj[groupkey] = tmp_group_obj[groupkey];

                          let grpidx = keywords_arr.indexOf(groupkey);
                          if (grpidx > -1) {
                            keywords_arr.splice(grpidx, 1);
                          }

                          if (debug) {
                            debug_res["grp_tkn"][groupkey] =
                              tmp_group_obj[groupkey];
                          }
                        }
                      }
                    }
                  });
                }
              }
            }
            console.log(resp_obj);
            console.log("keyword after group budget : " + keywords_arr);
            if (keywords_arr.length > 0) {
              let citydata = result[5];
              if (debug) {
                debug_res["ct"] = citydata;
              }
              if (citydata && Object.keys(citydata).length > 0) {
                CAMPAIGNLIST.forEach(function(camp_name, key) {
                  if (typeof citydata[camp_name] !== "undefined") {
                    let tmp_city_obj = {};
                    tmp_city_obj = JSON.stringify(citydata[camp_name]);
                    tmp_city_obj = JSON.parse(tmp_city_obj);

                    for (let citykey in tmp_city_obj) {
                      if (keywords_arr.includes(citykey)) {
                        resp_obj[citykey] = tmp_city_obj[citykey];

                        let ctidx = keywords_arr.indexOf(citykey);
                        if (ctidx > -1) {
                          keywords_arr.splice(ctidx, 1);
                        }
                        if (debug) {
                          debug_res["ct_tkn"][citykey] = tmp_city_obj[citykey];
                        }
                      }
                    }
                  }
                });
              }
            }

            console.log("result found after city budget");
            debug_res["kwd_rem"] = keywords_arr;
            return res.status(200).json({
              error: 0,
              msg: "Success",
              data: resp_obj,
              debug: debug_res
            });
          } else {
            resp_obj["error"] = 1;
            resp_obj["msg"] = "No keyword found";
            return res.status(500).json(resp_obj);
          }
        })
        .catch(err => {
          resp_obj["error"] = 1;
          resp_obj["msg"] = err.stack;
          return res.status(500).json(resp_obj);
        });
    } catch (exp) {
      resp_obj["error"] = 1;
      resp_obj["msg"] = exp.stack;
      return res.status(500).json(resp_obj);
    }
  }

  async getContractBudget(req, res) {
    let retun = "";
    if (!isEmpty(req.return)) {
      retun = req.return;
    }
    let resp_obj = {};
    try {
      req.body = trimObj(req.body);

      // Check Validation
      if (isEmpty(req.body.parentid)) {
        return res.status(400).json({error: 1, msg: "parentid is blank"});
      }

      // Assigning Params
      const parentid = req.body.parentid.toUpperCase();

      const conBudgetData = await conBudgetObj.findOne(
        {parentid: parentid},
        "-_id -createdAt -updatedAt -package._id -package.updatedAt -package.createdAt"
      );
      if (conBudgetData && Object.keys(conBudgetData).length > 0) {
        resp_obj["error"] = 0;
        resp_obj["msg"] = "Contract Budget Found";
        resp_obj["data"] = conBudgetData;
        if (retun === "data") {
          return conBudgetData;
        } else {
          return res.status(200).json(resp_obj);
        }
      }
      resp_obj["error"] = 1;
      resp_obj["msg"] = "Contract Budget Not Found.";
      if (retun === "data") {
        return null;
      } else {
        return res.status(200).json(resp_obj);
      }
    } catch (exp) {
      resp_obj["error"] = 1;
      resp_obj["msg"] = exp.stack;
      return res.status(500).json(resp_obj);
    }
  }

  async getEmployeeBudget(req, res) {
    let retun = "";
    if (!isEmpty(req.return)) {
      retun = req.return;
    }
    let resp_obj = {};
    try {
      req.body = trimObj(req.body);

      // Check Validation
      if (isEmpty(req.body.empcode)) {
        return res.status(400).json({error: 1, msg: "empcode is blank"});
      }

      // Assigning Params
      const empcode = req.body.empcode;

      const empBudgetData = await empBudgetObj.findOne(
        {empcode: empcode},
        "-_id -createdAt -updatedAt -package._id -package.updatedAt -package.createdAt"
      );
      if (empBudgetData && Object.keys(empBudgetData).length > 0) {
        resp_obj["error"] = 0;
        resp_obj["msg"] = "Employee Budget Found";
        resp_obj["data"] = empBudgetData;
        if (retun === "data") {
          return empBudgetData;
        } else {
          return res.status(200).json(resp_obj);
        }
      }
      resp_obj["error"] = 1;
      resp_obj["msg"] = "Employee Budget Not Found.";
      if (retun === "data") {
        return null;
      } else {
        return res.status(200).json(resp_obj);
      }
    } catch (exp) {
      resp_obj["error"] = 1;
      resp_obj["msg"] = exp.stack;
      return res.status(500).json(resp_obj);
    }
  }

  async getTeamBudget(req, res) {
    let retun = "";
    if (!isEmpty(req.return)) {
      retun = req.return;
    }
    let resp_obj = {};
    try {
      req.body = trimObj(req.body);

      // Check Validation
      if (isEmpty(req.body.city)) {
        return res.status(400).json({error: 1, msg: "city is blank"});
      }
      if (isEmpty(req.body.team_type)) {
        return res.status(400).json({error: 1, msg: "team_type is blank"});
      }

      // Assigning Params
      const city = req.body.city.toLowerCase();
      const team_type = req.body.team_type.toLowerCase();

      const teamBudgetData = await teamBudgetObj.findOne(
        {city: city, [team_type]: {$exists: true}},
        "-_id -createdAt -updatedAt -" + [team_type] + ".package._id"
      );
      if (teamBudgetData && Object.keys(teamBudgetData).length > 0) {
        resp_obj["error"] = 0;
        resp_obj["msg"] = "Team Budget Found";
        resp_obj["data"] = teamBudgetData;
        if (retun === "data") {
          return teamBudgetData;
        } else {
          return res.status(200).json(resp_obj);
        }
      }
      resp_obj["error"] = 1;
      resp_obj["msg"] = "Team Budget Not Found.";
      if (retun === "data") {
        return null;
      } else {
        return res.status(200).json(resp_obj);
      }
    } catch (exp) {
      resp_obj["error"] = 1;
      resp_obj["msg"] = exp.stack;
      return res.status(500).json(resp_obj);
    }
  }

  async getGroupBudget(req, res) {
    let retun = "";
    if (!isEmpty(req.return)) {
      retun = req.return;
    }
    let resp_obj = {};
    try {
      req.body = trimObj(req.body);

      // Check Validation
      if (isEmpty(req.body.city)) {
        return res.status(400).json({error: 1, msg: "city is blank"});
      }
      if (isEmpty(req.body.group_type)) {
        return res.status(400).json({error: 1, msg: "group_type is blank"});
      }

      // Assigning Params
      const city = req.body.city.toLowerCase();
      const group_type = req.body.group_type.toLowerCase();

      const groupBudgetData = await groupBudgetObj.findOne(
        {city: city, [group_type]: {$exists: true}},
        "-_id -createdAt -updatedAt -" + [group_type] + ".package._id"
      );
      if (groupBudgetData && Object.keys(groupBudgetData).length > 0) {
        resp_obj["error"] = 0;
        resp_obj["msg"] = "Group Budget Found";
        resp_obj["data"] = groupBudgetData;
        if (retun === "data") {
          return groupBudgetData;
        } else {
          return res.status(200).json(resp_obj);
        }
      }
      resp_obj["error"] = 1;
      resp_obj["msg"] = "Group Budget Not Found.";
      if (retun === "data") {
        return null;
      } else {
        return res.status(200).json(resp_obj);
      }
    } catch (exp) {
      resp_obj["error"] = 1;
      resp_obj["msg"] = exp.stack;
      return res.status(500).json(resp_obj);
    }
  }

  async getCityBudget(req, res) {
    let retun = "";
    if (!isEmpty(req.return)) {
      retun = req.return;
    }
    let resp_obj = {};
    try {
      req.body = trimObj(req.body);

      // Check Validation
      if (isEmpty(req.body.city)) {
        return res.status(400).json({error: 1, msg: "city is blank"});
      }

      // Assigning Params
      const city = req.body.city.toLowerCase();

      const cityBudgetData = await cityBudgetObj.findOne(
        {city: city},
        "-_id -createdAt -updatedAt -package._id -package.updatedAt -package.createdAt"
      );

      if (cityBudgetData && Object.keys(cityBudgetData).length > 0) {
        resp_obj["error"] = 0;
        resp_obj["msg"] = "City Budget Found";
        resp_obj["data"] = cityBudgetData;
        if (retun === "data") {
          return cityBudgetData;
        } else {
          return res.status(200).json(resp_obj);
        }
      }
      resp_obj["error"] = 1;
      resp_obj["msg"] = "City Budget Not Found.";
      if (retun === "data") {
        return null;
      } else {
        return res.status(200).json(resp_obj);
      }
    } catch (exp) {
      resp_obj["error"] = 1;
      resp_obj["msg"] = exp.stack;
      return res.status(500).json(resp_obj);
    }
  }

  async setContractBudget(req, res) {
    let resp_obj = {};
    try {
      req.body = trimObj(req.body);
      const {errors, isValid} = await validateContractData(req.body);

      // Check Validation
      if (!isValid) {
        return res.status(400).json({error: 1, msg: errors});
      }

      // Assigning Params
      const parentid = req.body.parentid.toUpperCase();

      let update_obj = {};

      // Campaign Data
      CAMPAIGNLIST.forEach(function(camp_name, key) {
        if (!isEmpty(req.body[camp_name])) {
          for (let key in req.body[camp_name]) {
            if (req.body[camp_name].hasOwnProperty(key)) {
              let field_nm = camp_name + "." + key;
              update_obj[field_nm] = req.body[camp_name][key];
            }
          }
        }
      });

      if (!isEmpty(update_obj)) {
        const updateConBudget = await conBudgetObj.findOneAndUpdate(
          {parentid: parentid},
          {
            $set: update_obj
          },
          {new: true, upsert: true}
        );
        if (updateConBudget && Object.keys(updateConBudget).length > 0) {
          resp_obj["error"] = 0;
          resp_obj["msg"] = "Contract Budget Updated";
          return res.status(200).json(resp_obj);
        }
        resp_obj["error"] = 1;
        resp_obj["msg"] = "There is a problem in updating contract budget.";
        return res.status(500).json(resp_obj);
      } else {
        return res.status(400).json({
          error: 1,
          msg: "No data to update!"
        });
      }
    } catch (exp) {
      resp_obj["error"] = 1;
      resp_obj["msg"] = exp.stack;
      return res.status(500).json(resp_obj);
    }
  }

  async setEmployeeBudget(req, res) {
    let resp_obj = {};
    try {
      req.body = trimObj(req.body);
      const {errors, isValid} = validateEmployeeData(req.body);

      // Check Validation
      if (!isValid) {
        return res.status(400).json({error: 1, msg: errors});
      }

      // Assigning Params
      const empcode = req.body.empcode;
      const empname = req.body.empname;

      let update_obj = {};

      // Campaign Data
      CAMPAIGNLIST.forEach(function(camp_name, key) {
        if (!isEmpty(req.body[camp_name])) {
          for (let key in req.body[camp_name]) {
            if (req.body[camp_name].hasOwnProperty(key)) {
              let field_nm = camp_name + "." + key;
              update_obj[field_nm] = req.body[camp_name][key];
            }
          }
        }
      });

      if (!isEmpty(update_obj)) {
        update_obj.empname = empname;
        const updateEmpBudget = await empBudgetObj.findOneAndUpdate(
          {empcode: empcode},
          {
            $set: update_obj
          },
          {new: true, upsert: true}
        );
        if (updateEmpBudget && Object.keys(updateEmpBudget).length > 0) {
          resp_obj["error"] = 0;
          resp_obj["msg"] = "Employee Budget Updated";
          return res.status(200).json(resp_obj);
        }
        resp_obj["error"] = 1;
        resp_obj["msg"] = "There is a problem in updating employee budget.";
        return res.status(500).json(resp_obj);
      } else {
        return res.status(400).json({
          error: 1,
          msg: "No data to update!"
        });
      }
    } catch (exp) {
      resp_obj["error"] = 1;
      resp_obj["msg"] = exp.stack;
      return res.status(500).json(resp_obj);
    }
  }

  async setTeamBudget(req, res) {
    let resp_obj = {};
    try {
      req.body = trimObj(req.body);
      const {errors, isValid} = validateTeamData(req.body);

      // Check Validation
      if (!isValid) {
        return res.status(400).json({error: 1, msg: errors});
      }
      // Assigning Params
      const city = req.body.city.toLowerCase();

      let update_obj = {};

      TEAMLIST.forEach(function(team_name, key) {
        if (!isEmpty(req.body[team_name])) {
          update_obj[team_name] = {};
        }

        // Campaign Data
        CAMPAIGNLIST.forEach(function(camp_name, key) {
          if (!isEmpty(req.body[team_name])) {
            if (!isEmpty(req.body[team_name][camp_name])) {
              for (let key in req.body[team_name][camp_name]) {
                if (req.body[team_name][camp_name].hasOwnProperty(key)) {
                  let field_nm = team_name + "." + camp_name + "." + key;
                  update_obj[field_nm] = req.body[team_name][camp_name][key];
                }
              }
            }
          }
        });
        if (isEmpty(update_obj[team_name])) {
          delete update_obj[team_name];
        }
      });
      if (!isEmpty(update_obj)) {
        const updateTeamBudget = await teamBudgetObj.findOneAndUpdate(
          {city: city},
          {
            $set: update_obj
          },
          {new: true, upsert: true}
        );
        if (updateTeamBudget && Object.keys(updateTeamBudget).length > 0) {
          resp_obj["error"] = 0;
          resp_obj["msg"] = "Team Budget Updated";
          return res.status(200).json(resp_obj);
        }
        resp_obj["error"] = 1;
        resp_obj["msg"] = "There is a problem in updating team budget.";
        return res.status(500).json(resp_obj);
      } else {
        return res.status(400).json({
          error: 1,
          msg: "No data to update!"
        });
      }
    } catch (exp) {
      resp_obj["error"] = 1;
      resp_obj["msg"] = exp.stack;
      return res.status(500).json(resp_obj);
    }
  }

  async setGroupBudget(req, res) {
    let resp_obj = {};
    try {
      req.body = trimObj(req.body);
      const {errors, isValid} = validateGroupData(req.body);

      // Check Validation
      if (!isValid) {
        return res.status(400).json({error: 1, msg: errors});
      }

      // Assigning Params
      const city = req.body.city.toLowerCase();

      let update_obj = {};

      GROUPLIST.forEach(function(group_name, key) {
        if (!isEmpty(req.body[group_name])) {
          update_obj[group_name] = {};
        }

        // Campaign Data
        CAMPAIGNLIST.forEach(function(camp_name, key) {
          if (!isEmpty(req.body[group_name])) {
            if (!isEmpty(req.body[group_name][camp_name])) {
              for (let key in req.body[group_name][camp_name]) {
                if (req.body[group_name][camp_name].hasOwnProperty(key)) {
                  let field_nm = group_name + "." + camp_name + "." + key;
                  update_obj[field_nm] = req.body[group_name][camp_name][key];
                }
              }
            }
          }
        });
        if (isEmpty(update_obj[group_name])) {
          delete update_obj[group_name];
        }
      });

      if (!isEmpty(update_obj)) {
        const updateGroupBudget = await groupBudgetObj.findOneAndUpdate(
          {city: city},
          {
            $set: update_obj
          },
          {new: true, upsert: true}
        );
        if (updateGroupBudget && Object.keys(updateGroupBudget).length > 0) {
          resp_obj["error"] = 0;
          resp_obj["msg"] = "Group Budget Updated";
          return res.status(200).json(resp_obj);
        }
        resp_obj["error"] = 1;
        resp_obj["msg"] = "There is a problem in updating group budget.";
        return res.status(500).json(resp_obj);
      } else {
        return res.status(400).json({
          error: 1,
          msg: "No data to update!"
        });
      }
    } catch (exp) {
      resp_obj["error"] = 1;
      resp_obj["msg"] = exp.stack;
      return res.status(500).json(resp_obj);
    }
  }

  async setCityBudget(req, res) {
    let resp_obj = {};
    try {
      req.body = trimObj(req.body);
      const {errors, isValid} = validateCityData(req.body);

      // Check Validation
      if (!isValid) {
        return res.status(400).json({error: 1, msg: errors});
      }

      // Assigning Params
      const city = req.body.city.toLowerCase();

      let update_obj = {};

      // Campaign Data
      CAMPAIGNLIST.forEach(function(camp_name, key) {
        if (!isEmpty(req.body[camp_name])) {
          for (let key in req.body[camp_name]) {
            if (req.body[camp_name].hasOwnProperty(key)) {
              let field_nm = camp_name + "." + key;
              update_obj[field_nm] = req.body[camp_name][key];
            }
          }
        }
      });
      if (!isEmpty(update_obj)) {
        const updateCityBudget = await cityBudgetObj.findOneAndUpdate(
          {city: city},
          {
            $set: update_obj
          },
          {new: true, upsert: true}
        );
        if (updateCityBudget && Object.keys(updateCityBudget).length > 0) {
          resp_obj["error"] = 0;
          resp_obj["msg"] = "City Budget Updated";
          return res.status(200).json(resp_obj);
        }
        resp_obj["error"] = 1;
        resp_obj["msg"] = "There is a problem in updating city budget.";
        return res.status(500).json(resp_obj);
      } else {
        return res.status(400).json({
          error: 1,
          msg: "No data to update!"
        });
      }
    } catch (exp) {
      resp_obj["error"] = 1;
      resp_obj["msg"] = exp.stack;
      return res.status(500).json(resp_obj);
    }
  }

  async bulkInsertCityBudget(req, res) {
    let resp_obj = {};
    try {
      req.body = trimObj(req.body);
      const {errors, isValid} = validateCityData(req.body);

      // Check Validation
      if (!isValid) {
        return res.status(400).json({error: 1, msg: errors});
      }

      // Assigning Params
      const city = req.body.city;

      let update_obj = {};

      // Campaign Data
      CAMPAIGNLIST.forEach(function(camp_name, key) {
        if (!isEmpty(req.body[camp_name])) {
          for (let key in req.body[camp_name]) {
            if (req.body[camp_name].hasOwnProperty(key)) {
              let field_nm = camp_name + "." + key;
              update_obj[field_nm] = req.body[camp_name][key];
            }
          }
        }
      });

      if (!isEmpty(update_obj)) {
        const citylist = city.split(",");

        var bulk = cityBudgetObj.collection.initializeOrderedBulkOp();
        let counter = 0;

        citylist.forEach(function(ctname) {
          ctname = ctname.toLowerCase();
          bulk
            .find({city: ctname})
            .upsert()
            .updateOne({
              $set: update_obj
            });

          counter++;
          if (counter % 100 == 0) {
            bulk.execute(function(err, r) {
              // do something with the result
              bulk = cityBudgetObj.collection.initializeOrderedBulkOp();
              counter = 0;
            });
          }
        });

        // Catch any docs in the queue under or over the 500's
        if (counter > 0) {
          bulk.execute(function(err, result) {
            // do something with the result here
            console.log("result : " + JSON.stringify(result));

            if (err) {
              resp_obj["error"] = 1;
              resp_obj["msg"] = err.stack;
              return res.status(500).json(resp_obj);
            }
            resp_obj["error"] = 0;
            resp_obj["msg"] = "City Budget Updated";
            return res.status(200).json(resp_obj);
          });
        }
      } else {
        return res.status(400).json({
          error: 1,
          msg: "No data to update!"
        });
      }
    } catch (exp) {
      resp_obj["error"] = 1;
      resp_obj["msg"] = exp.stack;
      return res.status(500).json(resp_obj);
    }
  }

  async resetPackageBudget(req, res) {
    let resp_obj = {};
    try {
      req.body = trimObj(req.body);

      // Check Validation
      if (isEmpty(req.body.budget_type)) {
        return res.status(400).json({error: 1, msg: "budget_type is blank"});
      }
      const budget_type = req.body.budget_type.toLowerCase();
      const budget_type_arr = ["group", "team", "user", "contractid"];
      if (!budget_type_arr.includes(budget_type)) {
        return res.status(400).json({error: 1, msg: "Invalid budget_type"});
      }
      req.return = "data"; // assign this variable to get data in response from below promise

      switch (budget_type) {
        case "group":
          if (isEmpty(req.body.city)) {
            return res.status(400).json({error: 1, msg: "city is blank"});
          }
          if (isEmpty(req.body.group_type)) {
            return res.status(400).json({error: 1, msg: "group_type is blank"});
          }
          const grpcity = req.body.city.toLowerCase();
          const group_type = req.body.group_type.toLowerCase();
          const groupBudgetData = await this.getGroupBudget(req, res);

          if (
            groupBudgetData &&
            Object.keys(groupBudgetData).length > 0 &&
            !isEmpty(groupBudgetData[group_type])
          ) {
            let update_obj = {};
            update_obj[group_type] = 1;

            if (!isEmpty(update_obj)) {
              const updateGroupBudget = await groupBudgetObj.findOneAndUpdate(
                {city: grpcity},
                {
                  $unset: update_obj
                },
                {new: true}
              );
              if (
                updateGroupBudget &&
                Object.keys(updateGroupBudget).length > 0
              ) {
                resp_obj["error"] = 0;
                resp_obj["msg"] = "Group Budget Updated";
                return res.status(200).json(resp_obj);
              }
              resp_obj["error"] = 1;
              resp_obj["msg"] = "There is a problem in updating group budget.";
              return res.status(500).json(resp_obj);
            } else {
              return res
                .status(200)
                .json({error: 0, msg: "Group Budget Not Found"});
            }
          } else {
            return res
              .status(200)
              .json({error: 0, msg: "Group Budget Not Found"});
          }
          break;
        case "team":
          if (isEmpty(req.body.city)) {
            return res.status(400).json({error: 1, msg: "city is blank"});
          }
          if (isEmpty(req.body.team_type)) {
            return res.status(400).json({error: 1, msg: "team_type is blank"});
          }
          const tmcity = req.body.city.toLowerCase();
          const team_type = req.body.team_type.toLowerCase();
          const teamBudgetData = await this.getTeamBudget(req, res);

          if (
            teamBudgetData &&
            Object.keys(teamBudgetData).length > 0 &&
            !isEmpty(teamBudgetData[team_type])
          ) {
            let update_obj = {};
            update_obj[team_type] = 1;

            if (!isEmpty(update_obj)) {
              const updateTeamBudget = await teamBudgetObj.findOneAndUpdate(
                {city: tmcity},
                {
                  $unset: update_obj
                },
                {new: true}
              );
              if (
                updateTeamBudget &&
                Object.keys(updateTeamBudget).length > 0
              ) {
                resp_obj["error"] = 0;
                resp_obj["msg"] = "Team Budget Updated";
                return res.status(200).json(resp_obj);
              }
              resp_obj["error"] = 1;
              resp_obj["msg"] = "There is a problem in updating team budget.";
              return res.status(500).json(resp_obj);
            } else {
              return res
                .status(200)
                .json({error: 0, msg: "Team Budget Not Found"});
            }
          } else {
            return res
              .status(200)
              .json({error: 0, msg: "Team Budget Not Found"});
          }
          break;
        case "user":
          if (isEmpty(req.body.empcode)) {
            return res.status(400).json({error: 1, msg: "empcode is blank"});
          }
          const empcode = req.body.empcode;
          const empBudgetData = await this.getEmployeeBudget(req, res);

          if (
            empBudgetData &&
            Object.keys(empBudgetData).length > 0 &&
            !isEmpty(empBudgetData["package"])
          ) {
            let update_obj = {};
            update_obj["package"] = 1;

            if (!isEmpty(update_obj)) {
              /*const updateEmpBudget = await empBudgetObj.findOneAndUpdate(
                {empcode: empcode},
                {
                  $unset: update_obj
                },
                {new: true}
              );*/
              const updateEmpBudget = await empBudgetObj.deleteOne({
                empcode: empcode
              });
              if (updateEmpBudget && Object.keys(updateEmpBudget).length > 0) {
                resp_obj["error"] = 0;
                resp_obj["msg"] = "Employee Budget Updated";
                return res.status(200).json(resp_obj);
              }
              resp_obj["error"] = 1;
              resp_obj["msg"] =
                "There is a problem in updating employee budget.";
              return res.status(500).json(resp_obj);
            } else {
              return res
                .status(200)
                .json({error: 0, msg: "Employee Budget Not Found"});
            }
          } else {
            return res
              .status(200)
              .json({error: 0, msg: "Employee Budget Not Found"});
          }
          break;
        case "contractid":
          if (isEmpty(req.body.parentid)) {
            return res.status(400).json({error: 1, msg: "parentid is blank"});
          }
          const parentid = req.body.parentid.toUpperCase();
          const conBudgetData = await this.getContractBudget(req, res);

          if (
            conBudgetData &&
            Object.keys(conBudgetData).length > 0 &&
            !isEmpty(conBudgetData["package"])
          ) {
            let update_obj = {};
            update_obj["package"] = 1;

            if (!isEmpty(update_obj)) {
              /*const updateConBudget = await conBudgetObj.findOneAndUpdate(
                {parentid: parentid},
                {
                  $unset: update_obj
                },
                {new: true}
              );*/
              const updateConBudget = await conBudgetObj.deleteOne({
                parentid: parentid
              });
              if (updateConBudget && Object.keys(updateConBudget).length > 0) {
                resp_obj["error"] = 0;
                resp_obj["msg"] = "Contract Budget Updated";
                return res.status(200).json(resp_obj);
              }
              resp_obj["error"] = 1;
              resp_obj["msg"] =
                "There is a problem in updating contract budget.";
              return res.status(500).json(resp_obj);
            } else {
              return res
                .status(200)
                .json({error: 0, msg: "Contract Budget Not Found"});
            }
          } else {
            return res
              .status(200)
              .json({error: 0, msg: "Contract Budget Not Found"});
          }
          break;
        default:
          return res.status(400).json({error: 1, msg: "Invalid budget_type"});
      }
    } catch (exp) {
      resp_obj["error"] = 1;
      resp_obj["msg"] = exp.stack;
      return res.status(500).json(resp_obj);
    }
  }
}
module.exports = BudgetClass;
