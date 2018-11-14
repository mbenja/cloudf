class SessionManager {

  constructor(connection){
    this.connection = connection;
  }

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
   * queries mysql for the user data associated with a session id
   * @param {String} session_id random string associated with a session
   * @returns {Promise} containing {user_id: ___, expires: ___}
   */
  validateSession(session_id){

    console.log("in validateSession");

    let promise = new Promise((resolve, reject) => {
      this.connection.query("SELECT * FROM sessions WHERE session_id=?", [session_id], (err, results, fields) => {
        if(err){
          console.log("error from mysql");
          reject({type: 'mysql', contents: err});
        }
        else if (results.length == 1 && (new Date()) < (new Date(results[0].expiration))){
          console.log(results[0].session_id);
          console.log(results[0].expiration);
          // console.log(new Date(results[0].expiration));
          // console.log(new Date());
          // return session id
          resolve(results[0].user_id);
        }
        else{
          console.log("invalid session");
          reject({type: 'auth', contents: 'INVALID SESSION'});
        }
      });
    });

    return promise;

  }

  /**
   * creates a new session in the database and returns session id
   * @param {String} user_id user id associated with a session
   * @returns {Promise} containing random session id string
   */
  createSession(user_id){

    //results[index].column
    let promise = new Promise((resolve, reject) => {

      let gen_id = this.getRandomString(32);

      console.log("in session promise");

      // create expiration date for one hour in the future
      let exp_date = new Date();
      exp_date.setHours(exp_date.getHours()+1);

      this.connection.query("INSERT INTO sessions VALUES (?, ?, ?)", [gen_id, user_id, exp_date], (err, results, fields) => {
        if(err){
          console.log("reject for error");
          reject({type: 'mysql', contents: err});
        }
        else{
          console.log("resolve");
          resolve(gen_id);
        }
      });
    });

    return promise;
  }

  refreshSession(session_id){

    let promise = new Promise((resolve, reject) => {
      // create expiration date for one hour in the future
      let exp_date = new Date();
      exp_date.setHours(exp_date.getHours()+1);

      this.connection.query("UPDATE sessions SET expiration = ? WHERE session_id = ?", [exp_date, session_id], (err, results, fields) => {
        if(err){
          console.log("refresh error: " + err);
          reject({type: 'mysql', contents: err});
        }
        else{
          console.log("refreshed session");
          resolve();
        }
      });
    });

    return promise;

  }

  /**
   * logs out user by removing session
   * @param {String} session_id random string associated with session
   * @returns {Promise} indicating status of logout
   */
  logout(session_id){

    let promise = new Promise((resolve, reject) => {
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
