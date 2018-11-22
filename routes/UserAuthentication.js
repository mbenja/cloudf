/**
 * import sessions manager
 * @type {Object}
 */
let sessions = require("./SessionManager.js");

/**
 * import bcrypt, used for hashing Passwords
 * @type {Object}
 */
const bcrypt = require('bcrypt');

/**
 * number of salt rounds to use for password hashing
 * @type {Number}
 */
const saltRounds = 10;

/**
 * exports of mongodb interaction module
 * @type {Object}
 */
var mongodb = require('mongodb');

/**
 * contains methods for authenticating and creating new users
 */
class UserAuthentication {

  /**
   * @param {Object} connection a mysql connection object, created using mysql.createConnection
   * @param {String} mongo_url url of the mongo server that files are stored in
   */
  constructor(connection, mongo_url){
    this.connection = connection;
    this.mongo_url = mongo_url;
    this.sessions = new sessions.SessionManager(connection);
  }

  /**
   * authenticates a given user and hashed password
   * @param {String} email user email
   * @param {String} password the user's password
   * @returns {Promise} a promise containing a session id
   */
  authenticate(email, password){
    console.log("authenticating user");

    let promise = new Promise((resolve, reject) => {

      // query users for people with the given email
      this.connection.query("SELECT * FROM users WHERE email=?", [email], (err, results, fields) => {
        if(err){
          console.log("reject for error");
          reject({type: 'mysql', contents: err});
        }
        else if (results.length == 1){

          // a user with this email exists.
          // compare the given password with the hashed password stored in the db
          bcrypt.compare(password, results[0].password).then((res) => {
            // if the passwords match...
            if(res){

              let user_id = results[0].user_id;
              // create a session with the user id retrieved from the table
              this.sessions.createSession(user_id).then(
                (session_id) => {

                  // return the session id obtained
                  resolve(session_id);
                },
                (error) => {
                  reject(error);
                }
              );
            }
            else{
              reject({type: 'auth', contents: 'INCORRECT PASSWORD'});
            }

          });

        }
        else{
          //console.log("reject for invalid user");
          reject({type: 'auth', contents: 'INVALID USER'});
        }
      });

    });

    return promise;

  }

  /**
   * creates a user with the given username and hashed pass
   * @param {String} email user email
   * @param {String} password the user's password
   * @returns {Promise}
   */
  createUser(email, password){

    console.log("creating user");

    let new_user_id = this.sessions.getRandomString(32);

    let promise = new Promise((resolve, reject) => {

      // check if the given email has been used already
      this.connection.query("SELECT * FROM users WHERE email = ?", [email], (err, results, fields) => {
        if(err){
          reject({type: 'mysql', contents: err});
        }
        else if(results.length == 0){

          // hash the password
          bcrypt.hash(password, saltRounds).then((hash) => {

            // put the new user into the users table
            this.connection.query("INSERT INTO users VALUES (?, ?, ?)", [new_user_id, email, hash], (err, results, fields) => {
              if(err){
                reject({type: 'mysql', contents: err});
              }
              else{
                // connect to the mongo database
                mongodb.MongoClient.connect(this.mongo_url, function(err, database){

                  // handle bad connection to mongoDB
                  if (database == null) {
                    database.close();
                    reject({type: 'mongo', contents: 'BROKEN PIPE'});
                  } else {
                    console.log("Successfully connected to mongoDB");

                    const db = database.db('cloudf');
                    // create chunks collection for this user
                    db.createCollection(new_user_id + ".chunks", function(err, res) {
                      if (err){
                        database.close();
                        reject({type: 'mongo', contents: err});
                      }
                      else{
                        // create files collection for this user
                        db.createCollection(new_user_id + ".files", function(err, res) {
                          if (err){
                            database.close();
                            reject({type: 'mongo', contents: err});
                          }
                          else{
                            console.log("Collections created!");
                            database.close();
                            resolve();
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          });

        }
        else{
          reject({type: 'auth', contents: 'DUPLICATE EMAIL'});
        }
      });
    });

    return promise;

  }

}

exports.UserAuthentication = UserAuthentication;
