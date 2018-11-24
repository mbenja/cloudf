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
 * Exports of zip express module
 * @type {Object}
 */
const zip = require('express-zip');

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

/**
 * exports of connection definition file
 * @type {Object}
 */
// var client_state = {
//   user_id: 'Mo190PgQtcI6FyRF3gNAge8whXhdtRMx',
//   current_path: '',
//   current_upload_path_local: ''
// };
let conn_info = require('./connection.js');

/**
 * contains the mysql connection information
 * @type {Object}
 */
let connection = conn_info.connection;

/**
 * contains the mongo connection url
 * @type {String}
 */
let mongo_url = conn_info.mongo_url;

let cookieParser = require('cookie-parser');

/**
 * contains exports of session manager file
 * @type {Object}
 */
let sessions = require("./SessionManager.js");

/**
 * create instance of SessionManager class
 * @type {SessionManager}
 */
let session_mgr = new sessions.SessionManager(connection);

router.use(fileUpload());
router.use(cookieParser());

// setting up static folder
router.use(express.static(path.join(__dirname, 'public')));

/**
 * middleware function - before any call to file interaction backend, we
 * should validate the session.
 */
router.use(function valSession(req, res, next){
  console.log("in valSession");

  let session_id = req.cookies['cloudf_session'];
  if(!session_id){
    res.status(401).send('NOT LOGGED IN');
    return;
  }

  // call validatesession to check session in sql data
  session_mgr.validateSession(session_id).then(
    (user_id) => {
      // update the user in the client for next() callback functions
      client_user = user_id;

      // refresh the session
      session_mgr.refreshSession(session_id).then(
        () => {
          // if everything succeeded, go to the next response function for this request
          next();
        },
        (error) => {
          if(error.type == 'auth'){
            res.status(401).send(error.contents);
          }
          else{
            res.status(500).send(error.contents.code);
          }
        }
      );
    },
    (error) => {
      if(error.type == 'auth'){
        res.status(401).send(error.contents);
      }
      else{
        res.status(500).send(error.contents.code);
      }
    }
  );

});


/**
 * tracks the client's user id for requests after the session is validated
 */
let client_user = '';


/**
 * Route for getting root directory
 * Calls async function to get root directory, sends response
 * @param {String} user_id - the user id to retrieve root directory for
 */
router.get('/getRootDirectory', function(req, res) {
  console.log("GET /getRootDirectory");
  getRootDirectory().then((response) => {
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
  getSubdirectory(req.query.subdirectory).then((response) => {
    res.send(response);
  });
});



/**
 * Extracts upload_form data and calls for file to be uploaded if not duplicate
 */
router.post('/uploadFile', function(req, res) {
  console.log("POST /uploadFile");
  console.log(req.query);
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
      isInDirectory(req.query.current_path, input_upload_file.name).then((response) => {
        if (response === true) {
          // already exists
          res.send('FILE ALREADY EXISTS');
        } else if (response == 'BROKEN PIPE') {
          res.send(response);
        } else {
          // proceed
          // now call async function that uploads to mongoDB
          uploadFile(input_upload_file, req.query.current_path).then((response) => {
            res.send(response);
          })
        }
      })
    }
  });
});

/**

*/
router.post('/uploadDirectory', function(req, res) {
  console.log("POST /uploadDirectory");
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }

  // create folder on backend
  // ensure no duplicate uploads
  // adjust client state variables
  const current_path = req.query.current_path;
  const cupl = req.query.current_upload_path_local
  //const client_state_original = client_state.current_path;
  //let current_path = '/' + req.query.current_path.split('/')[1];
  // client_state.current_path = client_state.current_path.split('/');
  // client_state.current_path = '/' + client_state.current_path[1];
  isInDirectory(current_path, cupl).then((response) => {
    if (response === true) {
      // already exists
      res.send('DIRECTORY ALREADY EXISTS');
    } else if (response == 'BROKEN PIPE') {
      res.send(response);
    } else {
      // proceed
      createDirectory(current_path, cupl).then((response) => {
        // adjust client state variables
        //client_state.current_path = client_state_original;
        // now place all files within upload directory onto NodeJS server
        // get folder
        let input_upload_directory = req.files.input_upload_directory;
        var count = 0;
        for (var i = 0; i < input_upload_directory.length; i++) {
          // get file
          let input_upload_file = req.files.input_upload_directory[i];

          // place within temp dir on server
          const upload_file_name = input_upload_file.name;
          const upload_path = './routes/upload/' + upload_file_name;
          input_upload_file.mv(upload_path, function(err) {
            if (err) {
              console.log(err);
              return res.status(500).send(err);
            } else {
              // now call async function that uploads to mongoDB
              uploadFile(input_upload_file, current_path + '/' + cupl).then((response) => {
                count++;
                // only send response if last file
                if (count == input_upload_directory.length) {
                  res.send(response);
                }
              })
            }
          });
        }
      })
    }
  })
});



/**
 * Calls for directory to be created if not duplicate
 */
router.get('/createDirectory', function(req, res) {
  console.log("GET /createDirectory");
  // ensure no duplicate uploads
  isInDirectory(req.query.current_path, req.query.directory_name).then((response) => {
    if (response === true) {
      // already exists
      res.send('DIRECTORY ALREADY EXISTS');
    } else if (response == 'BROKEN PIPE') {
      res.send(response);
    } else {
      // proceed
      // now call async function that uploads to mongoDB
      createDirectory(req.query.current_path, req.query.directory_name).then((response) => {
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
 * Calls for directory to be deleted
 */
router.get('/deleteDirectory', function(req, res) {
  console.log("GET /deleteDirectory");
  // get directory
  getSubdirectory(req.query.directory_path).then((response) => {
    const obj = {
      contents: response,
    };
    // add directory itself
    obj.contents.push({ _id: req.query.directory_id });
    // call for delete
    deleteDirectory(obj).then((response) => {
      // download
      res.send(response);
    })
  });
});



/**
 * Calls for file to be downloaded
 */
router.get('/downloadFile', function(req, res) {
  console.log("GET /downloadFile");
  downloadFile(req.query).then((response) => {
    // download
    res.download(response, req.query.file_name, function(err) {
      if (err) {
        console.log(err);
      } else {
        // purge download directory
        purgeDownloadDirectory();
      }
    });
  })
});



/**
  * Calls for directory to be downloaded
  */
router.get('/downloadDirectory', function(req, res) {
  console.log("GET /downloadDirectory");
  // get directory
  getSubdirectory(req.query.directory_path).then((response) => {
    var subdirectory = [];
    // filter out placeholder inner directory documents
    for (var i = 0; i < response.length; i++) {
      if (response[i]["metadata"]["content_type"] != 'directory') {
        subdirectory.push(response[i]);
      }
    }
    const obj = {
      contents: subdirectory,
      directory_path: req.query.directory_path,
      directory_name: req.query.directory_name
    };
    // call for download
    downloadDirectory(obj).then((response) => {
      // download
      res.zip(response, req.query.directory_name + '.zip', function(err) {
        if (err) {

        } else {
          // purge download directory
          purgeDownloadDirectory();
        }
      });
    })
  });
});

/**
  * Calls for files to be moved
  */
router.get('/moveFiles', function(req, res) {
  console.log("GET /moveFiles");
  // call for files to be moved
  moveFiles(req.query.source_ids, req.query.destination_path).then((response) => {
      res.send(response);
    })
});

/**
  * Calls for name change to occur
  */
router.get('/changeName', function(req, res) {
  console.log("GET /nameChange");
  // ensure no duplicate names
  isInDirectory(req.query.current_path, req.query.new_name).then((response) => {
    if (response === true) {
      // already exists
      res.send('NAME ALREADY EXISTS');
    } else if (response == 'BROKEN PIPE') {
      res.send(response);
    } else {
      // proceed
      // now call async function that changes name in mongoDB
      changeName(req.query.documents, req.query.ids, req.query.paths, req.query.new_name).then((response) => {
        res.send(response);
      })
    }
  })
});


/**
  * Calls for upload directory to be purged
  */
router.get('/purgeUploadDirectory', function(req, res) {
  console.log("GET /purgeUploadDirectory");
  purgeUploadDirectory();
  res.send('done');
});

/**
 * shares a file with another user
 * @param {String} file_id - id of the file within mongo
 * @param {String} share_with - email of the user to share with
 */
router.get('/shareFile', function(req, res) {
  //req.query.file_id
  console.log('entered shareFile');

  // check that it is a valid user that is being shared with
  getUserInfoByEmail(req.query.share_with).then(
    (user_results) => {

      const obj = {
        file_id: req.query.file_id,
        file_name: req.query.file_name,
        content_type: req.query.content_type
      };

      // share the file
      shareFileTo(user_results.user_id, obj).then(
        () => {
          res.send("success");
        },
        (error) => {
          res.status(500).send(error);
        }
      );

    },
    (error) => {
      if(error.type == 'share'){
        res.status(404).send(error.contents);
      }
      else{
        res.status(500).send(error.contents.code);
      }
    }
  );
});

/**
 * shares a directory with another user
 * @param {String} directory_path - file path to the directory (but not including it)
 * @param {String} directory_name - name of the directory to share
 * @param {String} directory_id - file id of the directory within mongo
 * @param {String} share_with - email of the user to share with
 */
router.get('/shareDirectory', function(req, res) {

  // check that it is a valid user that is being shared with
  getUserInfoByEmail(req.query.share_with).then(
    (user_results) => {
      getSubdirectory(req.query.directory_path + '/' + req.query.directory_name).then((response) => {

        // getSubdirectory returns everything WITHIN the directory, but we also want
        // to send the actual directory too, so add that to the response object
        response.push({
          _id: req.query.directory_id,
          filename: req.query.directory_name,
          metadata: {path: req.query.directory_path,
                     content_type: 'directory'}
        });

        const obj = {
          contents: response,
          directory_path: req.query.directory_path
        };

        // share the directory
        shareDirectoryTo(user_results.user_id, obj).then(
          () => {
            res.send("success");
          },
          (error) => {
            res.status(500).send(error);
          }
        );

      });
    },
    (error) => {
      if(error.type == 'share'){
        res.status(404).send(error.contents);
      }
      else{
        res.status(500).send(error.contents.code);
      }
    }
  );

});

/**
 * queries mysql database for the given user based on email
 * @param {String} email - email of the user to search for
 * @returns {Object} containing user_id, email, hashed password
 */
async function getUserInfoByEmail(email){
  let promise = new Promise(function(resolve, reject) {
    connection.query("SELECT * FROM users WHERE email=?", [email], (err, results, fields) => {
      if(err){
        reject({type: 'mysql', contents: err});
      }
      else if(results.length == 1){
        resolve(results[0]);
      }
      else{
        reject({type: 'share', contents: 'USER NOT FOUND'});
      }
    })
  });

  return promise;
}

/**
 * queries mysql database for the given user based on user id
 * @param {String} user_id - user id of the user to search for
 * @returns {Object} containing user_id, email, hashed password
 */
async function getUserInfoByUserId(user_id){
 let promise = new Promise(function(resolve, reject) {
   connection.query("SELECT * FROM users WHERE user_id=?", [user_id], (err, results, fields) => {
     if(err){
       reject({type: 'mysql', contents: err});
     }
     else if(results.length == 1){
       resolve(results[0]);
     }
     else{
       reject({type: 'share', contents: 'USER NOT FOUND'});
     }
   })
 });

 return promise;
}


/**
 * checks if the user to share with has a "Shared" directory, and creates it if not present
 * @param {Object} db - mongo database that files are stored in
 * @returns {Promise}
 */
async function createIfNoSharedDir(db, user_id){
  // check if they have a shared folder
  let promise = new Promise((resolve, reject) => {
    // find the shared directory
    db.collection(user_id + ".files").findOne({$and: [{filename: "Shared"}, {'metadata.path': "/root"}, {'metadata.content_type': "directory"}]}).then(
      (shared_dir) => {
        if(!shared_dir){
          // if one was not found, create it
          createDirectory("/root", "Shared", user_id).then((response) => {
            if(response == 'success'){
              resolve();
            }
            else{
              reject(response);
            }
          });
        }
        else{
          resolve();
        }
      },
      (error) => {
        reject(error);
      }
    );
  });

  return promise;
}


/**
 * shares a given file with a given user
 * @param {String} share_user - user id to share with
 * @param {Object} file_info - contains properties file_id, file_name, and content_type of file being shared
 * @returns {Promise}
 */
async function shareFileTo(share_user, file_info){

  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(mongo_url, function(err, database) {
      if(database == null){
        reject('BROKEN PIPE');
      }
      else{
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');

        // creat the shared directory if needed
        createIfNoSharedDir(db, share_user).then(() => {

          // create object for file id to use in queries
          let file_id_obj = new mongodb.ObjectID(file_info.file_id);

          // create gridfs buckets for sharer and sharee collections
          var to_bucket = new mongodb.GridFSBucket(db, {
            bucketName: share_user
          });

          var from_bucket = new mongodb.GridFSBucket(db, {
            bucketName: client_user
          });

          getUserInfoByUserId(client_user).then((user_results) => {
            // create upload stream with associated metadata
            var upload_stream = to_bucket.openUploadStream(file_info.file_name);
            upload_stream.options.metadata = {
              date_added: dateFormat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT"),
              path: '/root/Shared',
              content_type: file_info.content_type,
              shared_by: user_results.email
            };

            console.log('created buckets');

            // create download stream of the file object and pipe it into the upload stream
            from_bucket.openDownloadStream(file_id_obj).
            pipe(upload_stream).
            on('error', function(error) {
              console.log(error);
              assert.ifError(error);
            }).
            on('finish', function() {
              console.log('success');
              database.close();
              resolve();
            });
          },
          (error) => {
            database.close();
            reject(error);
          });
        },
        (error) => {
          database.close();
          reject(error)
        });
      }
    });
  });

  return promise;
}



/**
 * shares a given file with a given user
 * @param {String} share_user - user id to share with
 * @param {Object} subdirectory - contains properties contents (array of files to be downloaded) and directory_path
 * @returns {Promise}
 */
async function shareDirectoryTo(share_user, subdirectory){

  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(mongo_url, function(err, database) {
      if(database == null){
        reject('BROKEN PIPE');
      }
      else{
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');

        // creat the shared directory if needed
        createIfNoSharedDir(db, share_user).then(() => {

          // create gridfs buckets for sharer and sharee collections
          var to_bucket = new mongodb.GridFSBucket(db, {
            bucketName: share_user
          });

          var from_bucket = new mongodb.GridFSBucket(db, {
            bucketName: client_user
          });

          // get client user's email for telling who shared things
          getUserInfoByUserId(client_user).then((user_results) => {

            var count = 0;
            for(var i = 0; i < subdirectory.contents.length; i++){

              // create object for file id to use in queries
              let file_id_obj = new mongodb.ObjectID(subdirectory.contents[i]["_id"]);

              const file_name = subdirectory.contents[i].filename;
              const new_path = subdirectory.contents[i].metadata.path.replace(subdirectory.directory_path, '/root/Shared');

              // create upload stream for this file
              let upload_stream = to_bucket.openUploadStream(file_name);
              upload_stream.options.metadata = {
                date_added: dateFormat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT"),
                path: new_path,
                content_type: subdirectory.contents[i].metadata.content_type,
                shared_by: user_results.email
              };

              from_bucket.openDownloadStream(file_id_obj).
              pipe(upload_stream).
              on('error', function(error) {
                assert.ifError(error);
              }).
              on('finish', function() {
                count++
                // only resolve if last file
                if (count == subdirectory.contents.length) {
                  database.close();
                  resolve('done');
                }
              });
            }
          },
          (error) => {
            reject(error);
          });

        },
        (error) => {
          reject(error)
        });
      }
    });
  });

  return promise;
}



/**
 * Retrieves an array of all documents within root directory of user collection
 * @param {String} user_id - the user id to retrieve root directory for
 * @returns {Array} documents - an array of document objects
 */
async function getRootDirectory() {
  console.log(client_user);
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(mongo_url, function(err, database) {
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');
        db.collection(client_user + '.files').find().toArray(function(err, documents) {
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
async function getSubdirectory(subdirectory) {
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(mongo_url, function(err, database) {
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');
        db.collection(client_user + '.files').find().toArray(function(err, documents) {
          database.close();
          resolve(documents);
        });
      }
    });
  });
  let documents = await promise;
  // filter out files that don't meet subdirectory path requirement
  var files = [];
  for (var i = 0; i < documents.length; i++) {
    if (documents[i]["metadata"]["path"].includes(subdirectory)) {
      files.push(documents[i]);
    }
  }
  return files;
}



/**
 * Uploads file from Node server to mongoDB
 * @param {Object} input_upload_file - the file object to be uploaded to mongoDB
 */
async function uploadFile(input_upload_file, moveto_path) {
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(mongo_url, function(err, database) {
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');
        // define bucket
        var bucket = new mongodb.GridFSBucket(db, {
          bucketName: client_user
        });
        // create upload stream
        upload_stream = bucket.openUploadStream(input_upload_file.name);
        upload_stream.options.metadata = {
          date_added: dateFormat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT"),
          path: moveto_path,
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
            //purgeUploadDirectory();
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
 * @param {String} enclosing_path - path to put the new directory in
 * @param {String} directory_name - the directory to be uploaded to mongoDB
 * @param {String} [user=client_user] - user to create folder in (defaults to the value in client_user)
 */
async function createDirectory(enclosing_path, directory_name, user) {

  user = user || client_user;

  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(mongo_url, function(err, database) {
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');
        // define bucket
        var bucket = new mongodb.GridFSBucket(db, {
          bucketName: user
        });
        // create upload stream
        upload_stream = bucket.openUploadStream(directory_name);
        upload_stream.options.metadata = {
          date_added: dateFormat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT"),
          path: enclosing_path,
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
            // purgeUploadDirectory();
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
    mongodb.MongoClient.connect(mongo_url, function(err, database) {
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');
        db.collection(client_user + '.files').deleteOne({_id: new mongodb.ObjectID(file_id)}, function(err, response) {
          database.close();
          resolve(response);
        });
      }
    });
  });
}



/**
 * Deletes specified files by ID
 * @param {Object} subdirectory - files to be deleted
 */
async function deleteDirectory(subdirectory) {
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(mongo_url, function(err, database) {
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');

        var count = 0;
        for (var i = 0; i < subdirectory.contents.length; i++) {
          db.collection(client_user + '.files').deleteOne({_id: new mongodb.ObjectID(subdirectory.contents[i]["_id"])}, function(err, response) {
            count++;
            // only resolve if last file
            if (count == subdirectory.contents.length) {
              database.close();
              resolve('done');
            }
          });
        }
      }
    });
  });

  return promise;
}



/**
 * Places specified file on Node server and sends path back to router
 * @param {Object} file_object - unique file to be downloaded
 * @returns {String} path of file to be downloaded
 */
async function downloadFile(file_object) {
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(mongo_url, function(err, database) {
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
          bucketName: client_user
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
* Places all files within directory on NodeJS server
* @param {Array} subdirectory - array of files to be downloaded
* @returns {Array} Array of file objects with all files within directory
*/
async function downloadDirectory(subdirectory) {
  // array to be sent back
  var node_directory = [];
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(mongo_url, function(err, database) {
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');

        // define bucket
        var bucket = new mongodb.GridFSBucket(db, {
          bucketName: client_user
        });

        // iterate through subdirectory, placing each file on NodeJS server
        var count = 0;
        for (var i = 0; i < subdirectory.contents.length; i++) {
          // create names for files on server
          const file_name = subdirectory.contents[i]["filename"];
          const download_name = subdirectory.contents[i]["metadata"]["path"].replace(subdirectory.directory_path, subdirectory.directory_name) +
          '/' + file_name;
          // write file to server
          bucket.openDownloadStream(new mongodb.ObjectID(subdirectory.contents[i]["_id"])).
          pipe(fs.createWriteStream('./routes/download/' + file_name)).
          on('error', function(error) {
            assert.ifError(error);
          }).
          on('finish', function() {
            // push object to array
            var obj = {
              path: './routes/download/' + file_name,
              name: download_name
            };
            node_directory.push(obj);
            count++
            // only resolve if last file
            if (count == subdirectory.contents.length) {
              database.close();
              resolve('done');
            }
          });
        }
      }
    });
  });
  let done = await promise;
  return node_directory;
}

/**
 * Moves files according to specification
 * @param {Array} source_ids - the ids of the files to be moved
 * @param {String} destination_path - the path to set for each file
 */
 async function moveFiles(source_ids, destination_path) {
   let promise = new Promise(function(resolve, reject) {
     mongodb.MongoClient.connect(mongo_url, function(err, database) {
       // handle bad connection to mongoDB
       if (database == null) {
         resolve('BROKEN PIPE');
       } else {
         console.log("Successfully connected to mongoDB");

         const db = database.db('cloudf');

         // define bucket
         var bucket = new mongodb.GridFSBucket(db, {
           bucketName: client_user
         });

         // create object to be set as document update
         const update_obj = {
           $set: {
             metadata: {
               path: destination_path
             }
           }
         };

         // iterate through source_ids and modify each one with the destination path
         var count = 0;
         for (var i = 0; i < source_ids.length; i++) {
           db.collection(client_user + '.files').updateOne({ _id: new mongodb.ObjectID(source_ids[i]) }, update_obj, function(err, res) {
             if (err) {
               console.log(err);
             } else {
               console.log(res);
             }
             count++;
             // only close and resolve if final document
             if (count == source_ids.length) {
               database.close();
               resolve(res);
             }
           });
         }
       }
     });
   });
   let result = await promise;
   return result;
 }

 /**
  * Changes name of given file with given name
  * @param {Array} ids - ids of documents to be modified
  * @param {Array} paths - paths of documents to be modified
  * @param {String} new_name - the new name of the document being modified
  */
async function changeName(documents, ids, paths, new_name) {
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(mongo_url, function(err, database) {
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');

        // define bucket
        var bucket = new mongodb.GridFSBucket(db, {
          bucketName: client_user
        });

        // check if file or directory
        if (ids.length == 0) {
          // file
        } else {
          // directory
          var count = 0;
          // iterate through ids and modify each one with the path and filename
          for (var i = 0; i < ids.length; i++) {
            // find matching document
            var matching_document;
            for (var j = 0; j < documents.length; j++) {
              if (documents[j]["_id"] == ids[i]) {
                // found match
                matching_document = j;
                // remove id key
                delete documents[matching_document]["_id"];
              }
            }
            if (i == 0) {
              // update fields in object
              documents[matching_document]["filename"] = new_name;
              documents[matching_document]["metadata"]["path"] = paths[i]
            } else {
              // update fields in object
              documents[matching_document]["metadata"]["path"] = paths[i];
            }
            // update document in mongo
            db.collection(client_user + '.files').updateOne({ _id: new mongodb.ObjectID(ids[i]) }, { $set: documents[matching_document] }, function(err, res) {
              if (err) {
                console.log(err);
              }
              count++;
              if (count == ids.length) {
                database.close();
                resolve(res);
              }
            });
          }
        }
      }
    });
  });
  let result = await promise;
  return result;
}



/**
 * Determines if the given file already exists in the given directory
 * @param {String} path - the directory in question
 * @param {String} file_name - the file name in question
 * @returns {Bool} exists - bool of whether or not the file exists
 */
async function isInDirectory(path, file_name) {
  let promise = new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(mongo_url, function(err, database) {
      // handle bad connection to mongoDB
      if (database == null) {
        resolve('BROKEN PIPE');
      } else {
        console.log("Successfully connected to mongoDB");

        const db = database.db('cloudf');
        db.collection(client_user + '.files').find({'metadata.path': path, 'filename': file_name}).toArray(function(err, documents) {
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
