var mysql = require('mysql');

let connection = mysql.createConnection({
  host: "mysql",
  port: "3306",
  user: "root",
  password: "yLH81JLGexLOVQ3K",
  database: "authentication"
});

exports.connection = connection;
