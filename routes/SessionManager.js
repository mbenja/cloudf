/**
 * class for managing sessions, ie. validation, creation, refreshing, and deletion
 */
class SessionManager {

  /**
   * @param {Object} connection a mysql connection object, created using mysql.createConnection
   */
  constructor(connection){
    this.connection = connection;
  }

  /**
   * helper method - returns random alphanumeric string of the given amount of characters
   * @param {Number} length number of characters in the string
   * @returns {String} a random string
   */
  getRandomString(length){
    let ranstr = "";
    for(let i = 0; i < length; i++){
      let charcode = Math.floor(Math.random()*61)
      charcode += (charcode < 10 ? 48 : 55);
      charcode += (charcode > 90 ? 7 : 0);
      ranstr += String.fromCharCode(charcode);
    }

    return ranstr;
  }

  /**
   * queries mysql to see if a given session id is valid and existant
   * @param {String} session_id random string associated with a session
   * @returns {Promise} a promise containing the user id assocated with the session
   */
  validateSession(session_id){

    console.log("in validateSession");

    let promise = new Promise((resolve, reject) => {
      // query database for records with the given session id
      this.connection.query("SELECT * FROM sessions WHERE session_id=?", [session_id], (err, results, fields) => {
        if(err){
          reject({type: 'mysql', contents: err});
        }
        else if (results.length == 1 && (new Date()) < (new Date(results[0].expiration))){
          // if a session exists and is not expired, resolve the promise
          resolve(results[0].user_id);
        }
        else{
          //console.log("invalid session");
          reject({type: 'auth', contents: 'INVALID SESSION'});
        }
      });
    });

    return promise;

  }

  /**
   * creates a new session in the database and returns session id
   * @param {String} user_id user id associated with the new session
   * @returns {Promise} containing random session id string
   */
  createSession(user_id){

    console.log("creating session");

    let promise = new Promise((resolve, reject) => {

      let gen_id = this.getRandomString(32);

      // create expiration date for one hour in the future
      let exp_date = new Date();
      exp_date.setHours(exp_date.getHours()+1);

      // put the new session record into the database
      this.connection.query("INSERT INTO sessions VALUES (?, ?, ?)", [gen_id, user_id, exp_date], (err, results, fields) => {
        if(err){
          reject({type: 'mysql', contents: err});
        }
        else{
          resolve(gen_id);
        }
      });
    });

    return promise;
  }

  /**
   * updates the given session id so it won't expire for another hour
   * @param {String} session_id session id to update
   * @returns {Promise}
   */
  refreshSession(session_id){

    let promise = new Promise((resolve, reject) => {
      // create expiration date for one hour in the future
      let exp_date = new Date();
      exp_date.setHours(exp_date.getHours()+1);

      // update the session id with the new expiration date
      this.connection.query("UPDATE sessions SET expiration = ? WHERE session_id = ?", [exp_date, session_id], (err, results, fields) => {
        if(err){
          reject({type: 'mysql', contents: err});
        }
        else{
          resolve();
        }
      });
    });

    return promise;

  }

  /**
   * logs out user by removing session
   * @param {String} session_id random string associated with session
   * @returns {Promise}
   */
  logout(session_id){

    let promise = new Promise((resolve, reject) => {
      // remove session record rom db
      this.connection.query("DELETE FROM sessions WHERE session_id = ?", [session_id], (err, results, fields) => {
        if(err){
          reject({type: 'mysql', contents: err});
        }
        else{
          resolve();
        }
      });
    });

    return promise;

  }

}

exports.SessionManager = SessionManager;
