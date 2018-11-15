/**
 * exports of mysql module
 * @type {Object}
 */
var mysql = require('mysql');

/**
 * a mysql connection object
 * @type {Object}
 */
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

/*
commands to execute for setting up mysql database:

create database authentication;
use authentication;
create table users (user_id varchar(32) not null, email varchar(128) not null, password varchar(64) not null, primary key (user_id));
create table sessions (session_id varchar(32) not null, user_id varchar(32) not null, expiration datetime not null, foreign key (user_id) references users(user_id));
*/
