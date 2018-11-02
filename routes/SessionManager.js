class SessionManager {

  constructor(connection){
    this.connection = connection;
  }

  /**
   * queries mysql for the user data associated with a session id
   * @param {String} session_id random string associated with a session
   * @returns {Promise} containing {user_id: ___, expires: ___}
   */
  validateSession(session_id){

  }

  /**
   * creates a new session in the database and returns session id
   * @param {String} user_id user id associated with a session
   * @returns {Promise} containing random session id string
   */
  async createSession(user_id){

    let gen_id = "";
    for(let i = 0; i < 32; i++){
      let charcode = Math.floor(Math.random()*68)
      charcode += (charcode < 10 ? 48 : 55);
      gen_id += String.fromCharCode(charcode);
    }
    //results[index].column
    let promise = new Promise((resolve, reject) => {
      this.connection.query("INSERT INTO sessions VALUES (?, ?, ?);", [gen_id, user_id, new Date()], (err, results, fields) => {
        if(err){
          reject(err);
        }
        else{
          resolve();
        }
      })
    });

    try{
      let results = await promise;
      return {success: true, session_id: gen_id};
    }
    catch(err){
      return {success: false, error: err};
    }
  }

  /**
   * logs out user by removing session
   * @param {String} session_id random string associated with session
   * @returns {Promise} indicating status of logout
   */
  logout(session_id){

  }

}

exports.SessionManager = SessionManager;
