const mysql = require("mysql");

const dbcon = {
  connection: function(options, query) {
    return new Promise(function(resolve, reject) {
      let {host, user, password, port, database} = options;
      let conn = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        port: port,
        database: database
      });
      conn.connect();
      conn.query(query, (err, result) => (err ? reject(err) : resolve(result)));
      conn.end();
    });
  },
  db_query: function(params) {
    const thisObj = this;
    return new Promise(function(resolve, reject) {
      let conn = params.conn;
      let query = params.query;
      if (params.debug) {
        console.log(query);
      }
      const queryres = thisObj
        .connection(conn, query)
        .then(response => {
          resolve(JSON.parse(JSON.stringify(response)));
        })
        .catch(err => {
          reject(err);
        });
    });
  }
};
module.exports = dbcon;
