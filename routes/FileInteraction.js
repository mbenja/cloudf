/*
  * Requiring dependencies
*/
var express = require('express');
var router = express.Router();
var fs = require('fs');
var mongodb = require('mongodb');
var assert = require('assert');
var dateFormat = require('dateformat');
var Readable = require('stream').Readable;
const fileUpload = require('express-fileupload');
var path = require('path');
router.use(fileUpload());

// setting up static folder
router.use(express.static(path.join(__dirname, 'public')));

/**
  * Defining object containing state variables from front-end
*/
var client_state = {
  user_id: 'Mo190PgQtcI6FyRF3gNAge8whXhdtRMx',
  current_path: ''
};

// Defining DB URL
var url = 'mongodb://localhost:32768/cloudf';

// TODO this is temporarily hard-coded until we implement user authentication
var user_id = 'Mo190PgQtcI6FyRF3gNAge8whXhdtRMx';

/**
  * Route for updating client state
  * @param {Object} client_state - the client state to be set as current
*/
router.get('/clientState', function(req, res) {
  console.log("GET /clientState");
  client_state = req.query;
  console.log(client_state);
  res.send('success');
});

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

*/
router.post('/uploadFile', function(req, res) {
  console.log("POST /uploadFile");
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }

  // get file
  let input_upload_file = req.files.input_upload_file;

  // place within temp dir on server
  const upload_file_name = input_upload_file.name;
  const upload_path = './' + upload_file_name;
  // var fstream = fs.createWriteStream('./upload/' + upload_file_name);
  // input_upload_file.pipe(fstream);
  // fstream.on('close', function () {
  //     res.send('upload succeeded!');
  //     //now call async function that uploads to mongoDB
  //     uploadFile(input_upload_file).then((response) => {
  //       res.send(response);
  //     });
  // });
  input_upload_file.mv(upload_path, function(err) {
    if (err) {
      console.log('error out');
      console.log(err);
      return res.status(500).send(err);
    } else {
      // now call async function that uploads to mongoDB
      uploadFile(input_upload_file).then((response) => {
        res.send(response);
      })
    }
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

/**

*/
async function uploadFile(input_upload_file) {
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(url, function(err, database) {
      assert.equal(null, err);
      console.log("Successfully connected to mongoDB");

      const db = database.db('cloudf');
      // define bucket
      var bucket = new mongodb.GridFSBucket(db, {
        bucketName: client_state.user_id
      });
      // create upload stream
      upload_stream = bucket.openUploadStream(input_upload_file.name);
      upload_stream.options.metadata = {
        date_added: dateFormat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT"),
        path: client_state.current_path,
        content_type: input_upload_file.mimetype
      };
      // create read stream and pipe
      fs.createReadStream('./' + input_upload_file.name).
        pipe(upload_stream).
        on('error', function(error) {
          assert.ifError(error);
        }).
        on('finish', function() {
          console.log('done!');
          database.close();
          process.exit(0);
        });
    });
  });
  let result = await promise;
  return result;
}

module.exports = router;
