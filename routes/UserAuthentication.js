let sessions = require("./SessionManager.js");

class UserAuthentication {
  constructor(connection){
    this.connection = connection;
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
          reject(err);
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

  }

}

exports.UserAuthentication = UserAuthentication;
