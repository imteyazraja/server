const {isEmpty} = require(__basedir + "/utility/helper");
class ConnCity {
  getConnCity(params) {
    let data_city = !isEmpty(params.city) ? params.city.toString() : "";

    const main_cities = [
      "mumbai",
      "delhi",
      "kolkata",
      "bangalore",
      "chennai",
      "pune",
      "hyderabad",
      "ahmedabad"
    ];
    let conn_resp = {};

    if (isEmpty(data_city)) {
      conn_resp["err"] = 1;
      conn_resp["msg"] = "Data City is blank";

      return conn_resp;
    } else {
      let data_obj = {};
      data_city = data_city.toLowerCase();
      if (main_cities.includes(data_city)) {
        conn_resp["err"] = 0;
        conn_resp["conn_city"] = data_city;
        conn_resp["remote_flag"] = 0;

        return conn_resp;
      } else {
        conn_resp["err"] = 0;
        conn_resp["conn_city"] = "remote";
        conn_resp["remote_flag"] = 1;
        return conn_resp;
      }
    }
  }
}
module.exports = ConnCity;
