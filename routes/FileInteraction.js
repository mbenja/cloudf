/*
  * Requiring dependencies
*/
var mongodb = require('mongodb');
var assert = require('assert');

/*

*/
class FileInteraction {

  constructor(url, db) {
    // url for mongoDB
    this.url = url;
  }

  /**
    * Retrieves an array of all documents within root directory of user collection
    * @param {String} user_id - the user id to retrieve root directory for
    * @returns {Array} documents - an array of document objects
  */
  getRootDirectory(user_id) {
    mongodb.MongoClient.connect(this.url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to server");

      db.collection(user_id + '.files').find().toArray(function(err, documents) {
        db.close();
        return documents;
      });
    });
  }

  /**
    * Retrieves an array of all documents within a specific subdirectory of user collection
    * @param {String} user_id - the user id to retrieve subdirectory for
    * @param {String} subdirectory - the subdirectory to retrieve
    * @returns {Array} documents - an array of document objects
  */
  getSubdirectory(user_id, subdirectory) {
    mongodb.MongoClient.connect(this.url, function(err, db) {
      assert.equal(null, err);
      console.log("Connected correctly to server");

      db.collection(user_id + '.files').find({'metadata.path': subdirectory}).toArray(function(err, documents) {
        db.close();
        return documents;
      });
    });
  }
}
