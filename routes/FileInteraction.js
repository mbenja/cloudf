/**
 * exports of express module
 * @type {Object}
 */
var express = require('express');

/**
 * express router for frontend/backend interaction
 * @type {Function}
 */
var router = express.Router();

/**
 * exports of fs (file system api) module
 * @type {Object}
 */
var fs = require('fs');

/**
 * exports of mongodb interaction module
 * @type {Object}
 */
var mongodb = require('mongodb');

/**
 * exports of assert module
 * @type {Object}
 */
var assert = require('assert');

/**
 * exports of dateformat module
 * @type {Object}
 */
var dateFormat = require('dateformat');

/**
 * Readable objet pulled from stream module
 * @type {Object}
 */
var Readable = require('stream').Readable;

/**
 * exports of fileupload express module
 * @type {Object}
 */
const fileUpload = require('express-fileupload');

/**
 * exports of path module
 * @type {Object}
 */
var path = require('path');

/**
 * exports of MIME types module
 * @type {Object}
 */
var mime = require('mime');

router.use(fileUpload());

// setting up static folder
router.use(express.static(path.join(__dirname, 'public')));

/**
 * Defining object containing state variables from front-end
 * @type {Object}
 */
var client_state = {
  user_id: 'Mo190PgQtcI6FyRF3gNAge8whXhdtRMx',
  current_path: ''
};

/**
 * port to connect to mongoDB on
 * @type {Number}
 */
const port = '27017';

/**
 * url to connect to mongodb on
 * @type {String}
 */
const url = 'mongodb://mongo:' + port + '/cloudf';

/**
 * userID to connect to mongoDB with
 * TODO this is temporarily hard-coded until we implement user authentication
 */
var user_id = 'Mo190PgQtcI6FyRF3gNAge8whXhdtRMx';



/**
 * Route for updating client state
 * @param {Object} client_state - the client state to be set as current
 */
router.get('/clientState', function(req, res) {
  console.log("GET /clientState");
  client_state = req.query;
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
 * Extracts upload_form data and calls for file to be uploaded if not duplicate
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
  const upload_path = './routes/upload/' + upload_file_name;
  input_upload_file.mv(upload_path, function(err) {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    } else {
      // ensure no duplicate uploads
      isInDirectory(client_state.current_path, input_upload_file.name).then((response) => {
        if (response === true) {
          // already exists
          res.send('FILE ALREADY EXISTS');
        } else if (response == 'BROKEN PIPE') {
          res.send(response);
        } else {
          // proceed
          // now call async function that uploads to mongoDB
          uploadFile(input_upload_file).then((response) => {
            res.send(response);
          })
        }
      })
    }
  });
});



/**
 * Calls for directory to be created if not duplicate
 */
router.get('/createDirectory', function(req, res) {
  console.log("GET /createDirectory");
  // ensure no duplicate uploads
  isInDirectory(client_state.current_path, req.query.directory_name).then((response) => {
    if (response === true) {
      // already exists
      res.send('DIRECTORY ALREADY EXISTS');
    } else if (response == 'BROKEN PIPE') {
      res.send(response);
    } else {
      // proceed
      // now call async function that uploads to mongoDB
      createDirectory(req.query.directory_name).then((response) => {
        res.send(response);
      })
    }
  })
});



/**
 * Calls for file to be deleted
 */
router.get('/deleteFile', function(req, res) {
  console.log("GET /deleteFile");
  deleteFile(req.query.file_id).then((response) => {
    res.send(response);
  })
});



/**
 * Calls for file to be downloaded
 */
router.get('/downloadFile', function(req, res) {
  console.log("GET /downloadFile");
  downloadFile(req.query).then((response) => {
    // download
    res.download(response, req.query.file_name);
    // purge download directory
    purgeDownloadDirectory();
  })
});



/**
 * Retrieves an array of all documents within root directory of user collection
 * @param {String} user_id - the user id to retrieve root directory for
 * @returns {Array} documents - an array of document objects
 */
async function getRootDirectory(user_id) {
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(url, function(err, database) {
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');
        db.collection(user_id + '.files').find().toArray(function(err, documents) {
          database.close();
          resolve(documents);
        });
      }
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
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');
        db.collection(user_id + '.files').find({'metadata.path': subdirectory}).toArray(function(err, documents) {
          database.close();
          resolve(documents);
        });
      }
    });
  });
  let documents = await promise;
  return documents;
}



/**
 * Uploads file from Node server to mongoDB
 * @param {Object} input_upload_file - the file object to be uploaded to mongoDB
 */
async function uploadFile(input_upload_file) {
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(url, function(err, database) {
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
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
        fs.createReadStream('./routes/upload/' + input_upload_file.name).
          pipe(upload_stream).
          on('error', function(error) {
            assert.ifError(error);
          }).
          on('finish', function() {
            console.log('File upload complete.');
            // close database connection
            database.close();
            // make call to purge temp upload directory
            purgeUploadDirectory();
            resolve('success');
          });
      }
    });
  });
  let result = await promise;
  return result;
}



/**
 * Uploads directory from Node server to mongoDB
 * @param {Object} directory_name - the directory to be uploaded to mongoDB
 */
async function createDirectory(directory_name) {
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(url, function(err, database) {
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');
        // define bucket
        var bucket = new mongodb.GridFSBucket(db, {
          bucketName: client_state.user_id
        });
        // create upload stream
        upload_stream = bucket.openUploadStream(directory_name);
        upload_stream.options.metadata = {
          date_added: dateFormat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT"),
          path: client_state.current_path,
          content_type: 'directory'
        };
        // create new readable stream
        var upload_stream_path = new Readable();
        // insert and end file
        upload_stream_path.push('./routes/upload/directory');
        upload_stream_path.push(null);
        // pipe
        upload_stream_path.
          pipe(upload_stream).
          on('error', function(error) {
            assert.ifError(error);
          }).
          on('finish', function() {
            console.log('Directory creation complete.');
            // close database connection
            database.close();
            // make call to purge temp upload directory
            purgeUploadDirectory();
            resolve('success');
          });
      }
    });
  });
  let result = await promise;
  return result;
}



/**
 * Deletes specified file by ID
 * @param {String} file_id - unique file id of file to be deleted
 */
async function deleteFile(file_id) {
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(url, function(err, database) {
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');
        db.collection(client_state.user_id + '.files').deleteOne({_id: new mongodb.ObjectID(file_id)}, function(err, response) {
          database.close();
          resolve(response);
        });
      }
    });
  });
}



/**
 * Places specified file on Node server and sends path back to router
 * @param {Object} file_object - unique file to be downloaded
 * @returns {String} path of file to be downloaded
 */
async function downloadFile(file_object) {
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(url, function(err, database) {
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');
        // create name of file for Node server
        const download_name = file_object["file_name"];

        // define bucket
        var bucket = new mongodb.GridFSBucket(db, {
          bucketName: client_state.user_id
        });

        bucket.openDownloadStream(new mongodb.ObjectID(file_object["file_id"])).
        pipe(fs.createWriteStream('./routes/download/' + download_name)).
        on('error', function(error) {
          assert.ifError(error);
        }).
        on('finish', function() {
          resolve('./routes/download/' + download_name);
        });
      }
    });
  });

  let download_path = await promise;
  return download_path;
}



/**
 * Determines if the given file already exists in the given directory
 * @param {String} path - the directory in question
 * @param {String} file_name - the file name in question
 * @returns {Bool} exists - bool of whether or not the file exists
 */
async function isInDirectory(path, file_name) {
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(url, function(err, database) {
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');
        db.collection(client_state.user_id + '.files').find({'metadata.path': path, 'filename': file_name}).toArray(function(err, documents) {
          database.close();
          resolve(documents);
        });
      }
    });
  });
  let documents = await promise;

  if (documents == 'BROKEN PIPE') {
    return documents;
  } else {
    if (documents.length != 0) {
      return true;
    } else {
      return false;
    }
  }
}



/**
 * Purges the routes/upload directory
 * To be called after each upload to ensure no data is left outstanding
 */
function purgeUploadDirectory() {
  // read the directory
  fs.readdir('./routes/upload', (err, files) => {
    if (err) {
      throw err;
    }
    // iterate through each file of the directory
    for (const file of files) {
      // remove each file
      fs.unlink(path.join('./routes/upload', file), err => {
        if (err) {
          throw err;
        }
      });
    }
  });
}



/**
 * Purges the routes/download directory
 * To be called after each download to ensure no data is left outstanding
 */
function purgeDownloadDirectory() {
  // read the directory
  fs.readdir('./routes/download', (err, files) => {
    if (err) {
      throw err;
    }
    // iterate through each file of the directory
    for (const file of files) {
      // remove each file
      fs.unlink(path.join('./routes/download', file), err => {
        if (err) {
          throw err;
        }
      });
    }
  });
}



module.exports = router;
