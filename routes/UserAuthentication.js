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
  async authenticate(email, password){
    console.log("in user promise");

    let promise = new Promise((resolve, reject) => {
      this.connection.query("SELECT * FROM users WHERE email=? AND password=?", [email, password], (err, results, fields) => {
        if(err){
          console.log("reject for error");
          reject(err.code);
        }
        else if (results.length == 1){
          // return session id
          let user_id = results[0].user_id;
          this.sessions.createSession(user_id).then((results) => {
            if(results.success){
              console.log("resolve with session");
              resolve(results.session_id);
            }
            else{
              console.log("reject for session failure");
              reject(results.error)
            }
          });
        }
        else{
          console.log("reject for invalid user");
          reject("invalid user")
        }
      });

    });

    try{
      let session_id = await promise;
      console.log("return success");
      return {success: true, session_id: session_id};
    }
    catch(err){
      console.log("return failure");
      return {success: false, error: err};
    }
  }

  /**
   * creates a user with the given username and hashed pass
   * @param {String} email user email
   * @param {String} password hashed password
   * @returns {Promise} containing user id
   */
  async createUser(email, password){

    let new_user_id = this.sessions.getRandomString(32);

    let promise = new Promise((resolve, reject) => {
      this.connection.query("INSERT INTO users VALUES (?, ?, ?)", [new_user_id, email, password], (err, results, fields) => {
        if(err){
          reject(err);
        }
        else{
          mongodb.MongoClient.connect(this.mongo_url, function(err, database) {
            // handle bad connection to mongoDB
            if (database == null) {
              reject('BROKEN PIPE');
            } else {
              console.log("Successfully connected to mongoDB");

              const db = database.db('cloudf');
              db.createCollection(new_user_id, function(err, res) {
                if (err){
                  reject(err);
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
    });

    try{
      let result = await promise;
      return {success: true};
    }
    catch(err){
      return {success: false, error: err};
    }

  }

}

exports.UserAuthentication = UserAuthentication;
