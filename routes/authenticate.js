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

let conn_info = require('./connection.js')
let connection = conn_info.connection;
let mongo_url = conn_info.mongo_url;

var authentication = require('./UserAuthentication.js')

var user_auth = new authentication.UserAuthentication(connection, mongo_url);

const bcrypt = require('bcrypt');
const saltRounds = 10;

/*
create database authentication;
use authentication;
create table users (user_id varchar(32) not null, email varchar(128) not null, password varchar(64) not null, primary key (user_id));
create table sessions (session_id varchar(32) not null, user_id varchar(32) not null, expiration datetime not null, foreign key (user_id) references users(user_id));
insert into users values ("Mo190PgQtcI6FyRF3gNAge8whXhdtRMx", "evanbrown@ku.edu", "test-pass");
*/
router.get('/initiateLogin', function(req, res) {
  user_auth.authenticate(req.query.email, req.query.password).then(
    (session_id) => {
      res.send(session_id);
    },
    (error) => {
      if(error.type == 'auth'){
        res.status(401).send(error.contents);
      }
      else{
        res.status(500).send(error.contents.code);
      }
    }
  );
});

router.get('/logout', function(req, res) {

  try{
    let session_id = req.headers.cookie.split('=')[1];
  }
  catch(err){
    res.status(401).send('NOT LOGGED IN');
    return;
  }

  user_auth.sessions.logout(req.query.session).then(
    () => {
      res.send('SUCCESSFUL LOGOUT');
    },
    (error) => {
      if(error.type == 'auth'){
        res.status(401).send(error.contents);
      }
      else{
        res.status(500).send(error.contents.code);
      }
    }
  );

});


router.get('/register', function(req, res){
  console.log(req.query);

  user_auth.createUser(req.query.email, req.query.password).then(
    () => {
      res.send('SUCCESSFUL REGISTRATION');
    },
    (error) => {
      if(error.type == 'auth'){
        res.status(401).send(error.contents);
      }
      else{
        res.status(500).send(error.contents.code);
      }
    }
  );
});


router.get('/crypto', function(req, res){
  let hashed = bcrypt.hash(req.query.password, saltRounds).then(
    (hash) => {
      res.send("hashed:" + hash);
    },
    (err) => {
      res.send("hash error:" + err);
    }
  );
});

module.exports = router;
