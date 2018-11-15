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

/**
 * exports of connection definition file
 * @type {Object}
 */
let conn_info = require('./connection.js');

/**
 * contains the mysql connection information
 * @type {Object}
 */
let connection = conn_info.connection;

/**
 * contains the mongo connection url
 * @type {String}
 */
let mongo_url = conn_info.mongo_url;

/**
 * contains exports of user authentication file
 * @type {Object}
 */
var authentication = require('./UserAuthentication.js')

/**
 * create an instance of the user authentication class
 * @type {UserAuthentication}
 */
var user_auth = new authentication.UserAuthentication(connection, mongo_url);

/**
 * route for logging into cloudf
 * @param {String} email user's email
 * @param {String} password user's password
 * @returns {String} session id of a session created for the user that logged in
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

/**
 * route for logging out of cloudf
 */
router.get('/logout', function(req, res) {

  // get the session id of the user from their cookies
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

/**
 * route for registering a new user in cloudf
 * @param {String} email email of the new user
 * @param {String} password password of the new user
 */
router.get('/register', function(req, res){

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



module.exports = router;
