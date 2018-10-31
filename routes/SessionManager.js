class SessionManager {

  constructor(){

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
  createSession(user_id){

  }

  /**
   * logs out user by removing session
   * @param {String} session_id random string associated with session
   * @returns {Promise} indicating status of logout
   */
  logout(session_id){
    
  }

}
