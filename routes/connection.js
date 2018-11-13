var mysql = require('mysql');

let connection = mysql.createConnection({
  host: "mysql",
  port: "3306",
  user: "root",
  password: "yLH81JLGexLOVQ3K",
  database: "authentication"
});

/**
 * port to connect to mongoDB on
 * @type {Number}
 */
const port = '27017';

/**
 * url to connect to mongodb on
 * @type {String}
 */
const url = 'mongodb://mongo:' + port + '/cloudf';

exports.connection = connection;
exports.mongo_url = url;
