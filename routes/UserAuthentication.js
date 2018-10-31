class UserAuthentication {
  constructor(connection){
    this.connection = connection;
  }

  /**
   * authenticates a given user and hashed password
   * @param {String} email user email
   * @param {String} password hashed password
   * @returns {Promise} containing user id
   */
  async authenticate(email, password){
    let promise = new Promise((resolve, reject) => {
      this.connection.connect((err) => {
        if(err){
          reject(err);
        }
        else{
          this.connection.query("SELECT * FROM users WHERE email=? AND password=?", [email, password], (err, results, fields) => {
            if(err){
              reject(err);
            }
            else{
              resolve([results, fields]);
            }
          });
        }
      });
    });

    try{
      let session_id = await promise;
      return {success: true, session_id: session_id};
    }
    catch(excep){
      return {success: false, error: excep};
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
