/**
 * exports of express module
 * @type {Object}
 */
var express = require('express');

/**
 * express router for frontend/backend interaction
 * @type {Function}
 */
var router = express.Router();

let connection = require('./connection.js').connection;

var authentication = require('./UserAuthentication.js')

var user_auth = new authentication.UserAuthentication(connection);

/*
create database authentication;
use authentication;
create table users (user_id varchar(32) not null, email varchar(128) not null, password varchar(64) not null, primary key (user_id));
create table sessions (session_id varchar(32) not null, user_id varchar(32) not null, expiration datetime not null, foreign key (user_id) references users(user_id));
insert into users values ("Mo190PgQtcI6FyRF3gNAge8whXhdtRMx", "evanbrown@ku.edu", "test-pass");
*/
router.get('/initiateLogin', function(req, res) {
  user_auth.authenticate(req.query.email, req.query.password).then(
    (results) => {
      res.send(results);
    }
  );
});

router.get('/logout', function(req, res) {
  user_auth.sessions.logout(req.query.session).then((results) => {
    if(results.success){
      res.send('SUCCESSFUL LOGOUT');
    }
    else{
      res.send('LOGOUT FAILED');
    }
  })
});

module.exports = router;
