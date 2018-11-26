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
 * contains exports of cookie parser node_module
 * @type {Object}
 */
var cookieParser = require('cookie-parser');

// tell backend to parse cookies and store them in req.cookies for all requests
router.use(cookieParser());

/**
 * route for logging into cloudf
 * @param {String} email user's email
 * @param {String} password user's password
 * @returns {String} session id of a session created for the user that logged in
 */
router.get('/initiateLogin', function(req, res) {
  user_auth.authenticate(req.query.email, req.query.password).then(
    (session_id) => {
      let exp_date = new Date();
      exp_date.setHours(exp_date.getHours()+1);

      res.cookie('cloudf_session', session_id, {expires: exp_date});
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
 * route for checking if user is logged in
 */
router.get('/checkLogin', function(req, res) {

  console.log("check login");
  let session_id = req.cookies['cloudf_session'];
  if(!session_id){
    res.status(401).send('NOT LOGGED IN');
    return;
  }

  // call validatesession to check session in sql data
  user_auth.sessions.validateSession(session_id).then(
    (user_id) => {

      // refresh the session
      user_auth.sessions.refreshSession(session_id).then(
        (new_date) => {
          // if everything succeeded, go to the next response function for this request
          res.cookie('cloudf_session', session_id, {expires: new_date});
          res.send('LOGGED IN');
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

  let session_id = req.cookies['cloudf_session'];
  if(!session_id){
    res.status(401).send('NOT LOGGED IN');
    return;
  }

  user_auth.sessions.logout(session_id).then(
    () => {
      res.clearCookie('cloudf_session');
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
