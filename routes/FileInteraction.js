/*
  * Requiring dependencies
*/
var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var assert = require('assert');

// Defining DB URL
var url = 'mongodb://localhost:32768/cloudf';

/**
  * Route for getting root directory
  * Calls async function to get root directory, sends response
  * @param {String} user_id - the user id to retrieve root directory for
*/
router.get('/getRootDirectory', function(req, res) {
  console.log("GET /getRootDirectory");
  getRootDirectory(req.query.user_id).then((response) => {
    res.send(response);
  });
});

/**
  * Route for getting sub directory
  * Calls async function to get subdirectory, sends response
  * @param {String} user_id - the user id to retrieve subdirectory for
  * @param {String} subdirectory - the subdirectory to retrieve
*/
router.get('/getSubdirectory', function(req, res) {
  console.log("GET /getSubdirectory");
  getSubdirectory(req.query.user_id, req.query.subdirectory).then((response) => {
    res.send(response);
  });
});

/**
  * Retrieves an array of all documents within root directory of user collection
  * @param {String} user_id - the user id to retrieve root directory for
  * @returns {Array} documents - an array of document objects
*/
async function getRootDirectory(user_id) {
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(url, function(err, database) {
      assert.equal(null, err);
      console.log("Successfully connected to mongoDB");

      const db = database.db('cloudf');
      db.collection(user_id + '.files').find().toArray(function(err, documents) {
        database.close();
        resolve(documents);
      });
    });
  });
  let documents = await promise;
  return documents;
}

/**
  * Retrieves an array of all documents within a specific subdirectory of user collection
  * @param {String} user_id - the user id to retrieve subdirectory for
  * @param {String} subdirectory - the subdirectory to retrieve
  * @returns {Array} documents - an array of document objects
*/
async function getSubdirectory(user_id, subdirectory) {
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(url, function(err, database) {
      assert.equal(null, err);
      console.log("Successfully connected to mongoDB");

      const db = database.db('cloudf');
      db.collection(user_id + '.files').find({'metadata.path': subdirectory}).toArray(function(err, documents) {
        database.close();
        resolve(documents);
      });
    });
  });
  let documents = await promise;
  return documents;
}

module.exports = router;
