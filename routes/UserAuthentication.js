let sessions = require("./SessionManager.js");

/**
 * exports of mongodb interaction module
 * @type {Object}
 */
var mongodb = require('mongodb');

class UserAuthentication {
  constructor(connection, mongo_url){
    this.connection = connection;
    this.mongo_url = mongo_url;
    this.sessions = new sessions.SessionManager(connection);
  }

  /**
   * authenticates a given user and hashed password
   * @param {String} email user email
   * @param {String} password hashed password
   * @returns {Promise} containing user id
   */
  authenticate(email, password){
    console.log("in user promise");

    let promise = new Promise((resolve, reject) => {
      this.connection.query("SELECT * FROM users WHERE email=? AND password=?", [email, password], (err, results, fields) => {
        if(err){
          console.log("reject for error");
          reject({type: 'mysql', contents: err});
        }
        else if (results.length == 1){
          // return session id
          let user_id = results[0].user_id;
          this.sessions.createSession(user_id).then(
            (session_id) => {
              console.log("resolve with session");
              resolve(session_id);
            },
            (error) => {
              reject(error);
            }
          );
        }
        else{
          console.log("reject for invalid user");
          reject({type: 'auth', contents: 'INVALID USER'});
        }
      });

    });

    return promise;

  }

  /**
   * creates a user with the given username and hashed pass
   * @param {String} email user email
   * @param {String} password hashed password
   * @returns {Promise} containing user id
   */
  createUser(email, password){

    let new_user_id = this.sessions.getRandomString(32);

    let promise = new Promise((resolve, reject) => {
      this.connection.query("SELECT * FROM users WHERE email = ? ", [email], (err, results, fields) => {
        if(err){
          reject({type: 'mysql', contents: err});
        }
        else if(results.length == 0){
          this.connection.query("INSERT INTO users VALUES (?, ?, ?)", [new_user_id, email, password], (err, results, fields) => {
            if(err){
              reject({type: 'mysql', contents: err});
            }
            else{
              mongodb.MongoClient.connect(this.mongo_url, function(err, database){
                // handle bad connection to mongoDB
                if (database == null) {
                  reject({type: 'mongo', contents: 'BROKEN PIPE'});
                } else {
                  console.log("Successfully connected to mongoDB");

                  const db = database.db('cloudf');
                  db.createCollection(new_user_id, function(err, res) {
                    if (err){
                      reject({type: 'mongo', contents: err});
                    }
                    else{
                      console.log("Collection created!");
                      database.close();
                      resolve();
                    }
                  });
                }
              });
            }
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
