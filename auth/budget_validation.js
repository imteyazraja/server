const Validator = require("validator");
const {isEmpty} = require(__basedir + "/utility/helper");

const ConnCity = require(__basedir + "/config/conncity");
const conf = require(__basedir + "/config/keys");
const dbcon = require(__basedir + "/config/db");

const {PackageSchema} = require(__basedir + "/models/campaign.model");

const {CAMPAIGNLIST, TEAMLIST} = require(__basedir + "/utility/constants");

module.exports.validateCampaignRequest = function validateCampaignRequest(
  data
) {
  let errors = "";

  data.parentid = !isEmpty(data.parentid) ? data.parentid : "";
  data.empcode = !isEmpty(data.empcode) ? data.empcode : "";
  data.team_type = !isEmpty(data.team_type) ? data.team_type : "";
  data.group_type = !isEmpty(data.group_type) ? data.group_type : "";
  data.city = !isEmpty(data.city) ? data.city : "";

  let tmp_arr = [];
  // Common Validation
  if (isEmpty(data.parentid)) {
    tmp_arr.push("parentid is blank");
  }
  if (isEmpty(data.empcode)) {
    tmp_arr.push("empcode is blank");
  }

  if (isEmpty(data.team_type)) {
    tmp_arr.push("team_type is blank");
  }

  if (isEmpty(data.group_type)) {
    tmp_arr.push("group_type is blank");
  }

  if (isEmpty(data.city)) {
    tmp_arr.push("city is blank");
  }
  if (tmp_arr.length > 0) {
    errors = tmp_arr.join(", ");
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports.validateContractData = async function validateContractData(
  data
) {
  let errors = "";

  data.parentid = !isEmpty(data.parentid) ? data.parentid : "";
  data.city = !isEmpty(data.city) ? data.city : "";

  package_data = !isEmpty(data.package) ? data.package : "";

  let tmp_arr = [];
  // Common Validation
  if (isEmpty(data.parentid)) {
    tmp_arr.push("parentid is blank");
  }
  if (isEmpty(data.city)) {
    tmp_arr.push("city is blank");
  } else {
    //Fetching Connection City
    let conn_city_obj = new ConnCity();
    const conninfo = await conn_city_obj.getConnCity(data);

    if (conninfo.err === 0) {
      const conn_city = conninfo.conn_city;

      const conn_iro = conf["iro"][conn_city];

      const contractInfo = await dbcon.db_query({
        conn: conn_iro,
        query:
          "SELECT parentid FROM tbl_id_generator WHERE parentid = '" +
          data.parentid +
          "' LIMIT 1"
      });
      if (Object.keys(contractInfo).length <= 0) {
        tmp_arr.push("Please enter valid parentid");
      }
    } else {
      tmp_arr.push("Not able to identify conn_city");
    }
  }

  // Package Validation

  if (!isEmpty(package_data)) {
    if (!isEmpty(PackageSchema["obj"])) {
      const pkg_fields = Object.keys(PackageSchema["obj"]);
      pkg_fields.forEach(function(pkgfld) {
        if (
          typeof package_data[pkgfld] !== "undefined" &&
          parseInt(package_data[pkgfld]) <= 0
        ) {
          tmp_arr.push("Invalid Package - " + pkgfld);
        }
      });
    } else {
      tmp_arr.push("Not able to find package fields");
    }
  }

  if (isEmpty(package_data)) {
    tmp_arr.push("Please send at least one campaign data to update");
  }

  if (tmp_arr.length > 0) {
    errors = tmp_arr.join(", ");
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports.validateEmployeeData = function validateEmployeeData(data) {
  let errors = "";

  data.empcode = !isEmpty(data.empcode) ? data.empcode : "";
  data.empname = !isEmpty(data.empname) ? data.empname : "";
  package_data = !isEmpty(data.package) ? data.package : "";

  let tmp_arr = [];
  // Common Validation
  if (isEmpty(data.empcode)) {
    tmp_arr.push("empcode is blank");
  }
  if (isEmpty(data.empname)) {
    tmp_arr.push("empname is blank");
  }
  // Package Validation

  if (!isEmpty(package_data)) {
    if (!isEmpty(PackageSchema["obj"])) {
      const pkg_fields = Object.keys(PackageSchema["obj"]);
      pkg_fields.forEach(function(pkgfld) {
        if (
          typeof package_data[pkgfld] !== "undefined" &&
          parseInt(package_data[pkgfld]) <= 0
        ) {
          tmp_arr.push("Invalid Package - " + pkgfld);
        }
      });
    } else {
      tmp_arr.push("Not able to find package fields");
    }
  }

  if (isEmpty(package_data)) {
    tmp_arr.push("Please send at least one campaign data to update");
  }

  if (tmp_arr.length > 0) {
    errors = tmp_arr.join(", ");
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports.validateTeamData = function validateTeamData(data) {
  let errors = "";
  let tmp_arr = [];

  const city = !isEmpty(data.city) ? data.city : "";

  // Common Validation
  if (isEmpty(city)) {
    tmp_arr.push("city is blank");
  }

  let team_type = "";

  TEAMLIST.forEach(function(tmtyp, key) {
    if (!isEmpty(data[tmtyp])) {
      team_type = tmtyp.toLowerCase();
      return false;
    }
  });

  if (isEmpty(team_type)) {
    tmp_arr.push("Please provide valid team_type / Incorrect format");
  }

  let campvalid = 0;
  let team_data = {};

  CAMPAIGNLIST.forEach(function(camp_name, key) {
    if (!isEmpty(data[team_type]) && !isEmpty(data[team_type][camp_name])) {
      team_data = data[team_type];
      campvalid = 1;
      return false;
    }
  });

  if (!campvalid) {
    tmp_arr.push("No campaign data found inside team node");
  }

  const team_pkg_data = !isEmpty(team_data.package) ? team_data.package : "";
  if (!isEmpty(team_pkg_data)) {
    if (!isEmpty(PackageSchema["obj"])) {
      const team_pkg_fields = Object.keys(PackageSchema["obj"]);
      team_pkg_fields.forEach(function(pkgfld) {
        if (
          typeof team_pkg_data[pkgfld] !== "undefined" &&
          parseInt(team_pkg_data[pkgfld]) <= 0
        ) {
          tmp_arr.push("Invalid Package - " + pkgfld);
        }
      });
    } else {
      tmp_arr.push("Not able to find package fields");
    }
  } else {
    tmp_arr.push("No campaign data found inside team node");
  }

  if (tmp_arr.length > 0) {
    errors = tmp_arr.join(", ");
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports.validateGroupData = function validateGroupData(data) {
  let errors = "";
  let tmp_arr = [];

  const city = !isEmpty(data.city) ? data.city : "";

  const tme_data = !isEmpty(data.tme) ? data.tme : "";
  const me_data = !isEmpty(data.me) ? data.me : "";
  const jda_data = !isEmpty(data.jda) ? data.jda : "";

  let tme_valid = 0;
  if (!isEmpty(tme_data)) {
    const tme_pkg_data = !isEmpty(tme_data.package) ? tme_data.package : "";
    if (!isEmpty(tme_pkg_data)) {
      tme_valid = 1;

      if (!isEmpty(PackageSchema["obj"])) {
        const tme_pkg_fields = Object.keys(PackageSchema["obj"]);
        tme_pkg_fields.forEach(function(pkgfld) {
          if (
            typeof tme_pkg_data[pkgfld] !== "undefined" &&
            parseInt(tme_pkg_data[pkgfld]) <= 0
          ) {
            tmp_arr.push("Invalid Package - " + pkgfld);
          }
        });
      } else {
        tmp_arr.push("Not able to find package fields");
      }
    }
  }

  let me_valid = 0;
  if (me_data) {
    const me_pkg_data = !isEmpty(me_data.package) ? me_data.package : "";

    if (!isEmpty(me_pkg_data)) {
      me_valid = 1;

      if (!isEmpty(PackageSchema["obj"])) {
        const me_pkg_fields = Object.keys(PackageSchema["obj"]);
        me_pkg_fields.forEach(function(pkgfld) {
          if (
            typeof me_pkg_data[pkgfld] !== "undefined" &&
            parseInt(me_pkg_data[pkgfld]) <= 0
          ) {
            tmp_arr.push("Invalid Package - " + pkgfld);
          }
        });
      } else {
        tmp_arr.push("Not able to find package fields");
      }
    }
  }

  let jda_valid = 0;
  if (jda_data) {
    const jda_pkg_data = !isEmpty(jda_data.package) ? jda_data.package : "";

    if (!isEmpty(jda_pkg_data)) {
      jda_valid = 1;

      if (!isEmpty(PackageSchema["obj"])) {
        const jda_pkg_fields = Object.keys(PackageSchema["obj"]);
        jda_pkg_fields.forEach(function(pkgfld) {
          if (
            typeof jda_pkg_data[pkgfld] !== "undefined" &&
            parseInt(jda_pkg_data[pkgfld]) <= 0
          ) {
            tmp_arr.push("Invalid Package - " + pkgfld);
          }
        });
      } else {
        tmp_arr.push("Not able to find package fields");
      }
    }
  }

  // Common Validation
  if (isEmpty(city)) {
    tmp_arr.push("city is blank");
  }

  if (!tme_data && !me_data && !jda_data) {
    tmp_arr.push("Please send at least one group data to update");
  }

  if (!tme_valid && !me_valid && !jda_valid) {
    tmp_arr.push("No campaign data found inside group node");
  }

  if (tmp_arr.length > 0) {
    errors = tmp_arr.join(", ");
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports.validateCityData = function validateCityData(data) {
  let errors = "";

  data.city = !isEmpty(data.city) ? data.city : "";

  package_data = !isEmpty(data.package) ? data.package : "";

  let tmp_arr = [];
  // Common Validation
  if (isEmpty(data.city)) {
    tmp_arr.push("city is blank");
  }
  // Package Validation

  if (!isEmpty(package_data)) {
    if (!isEmpty(PackageSchema["obj"])) {
      const pkg_fields = Object.keys(PackageSchema["obj"]);
      pkg_fields.forEach(function(pkgfld) {
        if (
          typeof package_data[pkgfld] !== "undefined" &&
          parseInt(package_data[pkgfld]) <= 0
        ) {
          tmp_arr.push("Invalid Package - " + pkgfld);
        }
      });
    } else {
      tmp_arr.push("Not able to find package fields");
    }
  }

  if (isEmpty(package_data)) {
    tmp_arr.push("Please send at least one campaign data to update");
  }

  if (tmp_arr.length > 0) {
    errors = tmp_arr.join(", ");
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
