/**
  * Calls all necessary tests for testing each portion of application
  * Test scores are updating accordingly
*/
function runTestSuite() {
  testBackend();
}

/**
  * Calls all necessary tests for testing back-end
  * Test scores are updating accordingly
*/
function testBackend() {
  var result;

  testSendState();
  testGetRootDirectory();
  testGetSubDirectory();
  testCreateDirectory();
  testDeleteDirectory();
  testDeleteFile();
  testUploadFile();
  testUploadDirectory();
  testAuth();
}

/**
  * Testing sendState
*/
function testSendState() {
  const obj = {
    user_id: 'Mo190PgQtcI6FyRF3gNAge8whXhdtRMx',
    current_path: current_path,
    current_upload_path_local: current_upload_path_local
  };
  $.ajax({
    url: '/FileInteraction/clientState',
    data: obj,
    success: function (data) {
      console.log("sendState: " + "PASSED");
    },
    error: function (data) {
      console.log("sendState: " + "FAILED");
    }
  });
}

/**
  * Testing getRootDirectory
*/
function testGetRootDirectory() {
  refreshData();
  if (current_file_data.length != 0) {
    console.log("getRootDirectory: " + "PASSED");
  } else {
    console.log("getRootDirectory: " + "FAILED");
  }
}

/**
  * Testing getSubdirectory
*/
function testGetSubDirectory() {
  // define data object for back-end
  const obj = {
    user_id: 'Mo190PgQtcI6FyRF3gNAge8whXhdtRMx',
    subdirectory: 'FOR_TEST_SUITE'
  };
  // perform ajax call
  $.ajax({
    url: '/FileInteraction/getSubdirectory',
    data: obj,
    success: function (response) {
      if (response == 'BROKEN PIPE') {
        console.log("getRootDirectory: " + "FAILED");
      } else {
        console.log("getRootDirectory: " + "PASSED");
      }
    },
    error: function (data) {
      console.log("getRootDirectory: " + "FAILED");
    }
  });
}

/**
  * Testing createDirectory
*/
function testCreateDirectory() {
  const obj = {
    directory_name: 'test_create_directory'
  };
  // perform ajax call
  $.ajax({
    url: '/FileInteraction/createDirectory',
    data: obj,
    success: function(response) {
      if (response == 'BROKEN PIPE') {
        console.log("createDirectory: " + "FAILED");
      } else {
        console.log("createDirectory: " + "PASSED");
        refreshData();
      }
    },
    error: function(response) {
      console.log("createDirectory: " + "FAILED");
     }
  });
}

/**
  * Testing deleteDirectory
*/
function testDeleteDirectory() {
  index = current_file_data.findIndex(x => x.filename == "test_delete_directory");
  const obj = {
    directory_id: current_file_data[index]["_id"],
    directory_path: current_file_data[index]["metadata"]["path"] + '/' +
    current_file_data[index]["filename"]
  };
  // perform ajax call
  $.ajax({
    url: '/FileInteraction/deleteDirectory',
    data: obj,
    success: function (response) {
      if (response == 'BROKEN PIPE') {
        console.log("deleteDirectory: " + "FAILED");
      } else {
        console.log("deleteDirectory: " + "PASSED");
        refreshData();
      }
    },
    error: function (data) {
      console.log("deleteDirectory: " + "FAILED");
    }
  });
}

/**
  * Testing deleteFile
*/
function testDeleteFile() {
  index = current_file_data.findIndex(x => x.filename == "test_delete_file.rtf");
  const obj = {
    file_id: current_file_data[index]["_id"]
  };
  // perform ajax call
  $.ajax({
    url: '/FileInteraction/deleteFile',
    data: obj,
    success: function (response) {
      if (response == 'BROKEN PIPE') {
        console.log("deleteFile: " + "FAILED");
      } else {
        console.log("deleteFile: " + "PASSED");
        refreshData();
      }
    },
    error: function (data) {
      console.log("deleteFile: " + "FAILED");
    }
  });
}

/**
  * Testing uploadFile
*/
function testUploadFile() {
  $('#modal_upload_form_test').modal('show');
}

/**
 * Defining on submit for upload_form so that we can handle on complete, etc.
 */
$('#upload_form_test').submit(function(event) {
  event.preventDefault();
  var form_data = $('#upload_form_test').serialize();
  $(this).ajaxSubmit({
    data: form_data,
    contentType: 'application/json',
    success: function(response) {
      if (response == 'FILE ALREADY EXISTS') {
        console.log("uploadFile: " + "FAILED");
      } else if (response == 'BROKEN PIPE') {
        console.log("uploadFile: " + "FAILED");
      } else {
        console.log("uploadFile: " + "PASSED");
        refreshData();
      }
    },
    error: function(response) {
      console.log("uploadFile: " + "FAILED");
     }
  });
  document.getElementById("input_upload_file").value = "";
  document.getElementById("input_upload_directory").value = "";
  return false;
});

/**
  * Testing uploadFile
*/
function testUploadDirectory() {
  $('#modal_upload_form_test').modal('show');
}

/**
 * Defining on submit for upload_form_test_directory so that we can handle on complete, etc.
 */
$('#upload_form_directory_test').submit(function(event) {
  event.preventDefault();
  var form_data = $('#upload_form_directory_test').serialize();
  $(this).ajaxSubmit({
    data: form_data,
    contentType: 'application/json',
    success: function(response) {
      $('#modal_upload_form_test').modal('hide');
      if (response == 'FILE ALREADY EXISTS') {
        console.log("uploadDirectory: " + "FAILED");
      } else if (response == 'DIRECTORY ALREADY EXISTS') {
        console.log("uploadDirectory: " + "FAILED");
      } else if (response == 'BROKEN PIPE') {
        console.log("uploadDirectory: " + "FAILED");
      } else {
        console.log("uploadDirectory: " + "PASSED");
        refreshData();
      }
    },
    error: function(response) {
      console.log("uploadDirectory: " + "FAILED");
     }
  });
  document.getElementById("input_upload_file").value = "";
  document.getElementById("input_upload_directory").value = "";
  return false;
});

async function testAuth(){
  // initially logout the user
  Cookies.remove('cloudf_session')
  let testUser = 'example' + Math.floor(Math.random()*1000000) + '@example.com';

  await testNewRegistration(testUser);
  await testExistingRegistration(testUser);
}

/**
 * test the registration of a new user is successful
 */
async function testNewRegistration(testUser){

  let promise = new Promise((resolve, reject) => {
    $.ajax({
      url: '/authenticate/register',
      data: {email: testUser,
             password: 'examplepass'},
      success: () => {
        console.log("register PASSED");
        resolve();
      },
      error: (error) => {
        console.log("register FAILED");
        resolve();
      }
    });
  });

  return promise;

}

/**
 * test that registration fails when a user already exists
 */
 async function testExistingRegistration(testUser){

   let promise = new Promise((resolve, reject) => {
     $.ajax({
       url: '/authenticate/register',
       data: {email: testUser,
              password: 'examplepass2'},
       success: () => {
         console.log("register w/ existing user FAILED");
         resolve();
       },
       error: (error) => {
         if(error.responseText == "DUPLICATE EMAIL"){
           console.log("register w/ existing user PASSED");
         }
         else{
           console.log("register w/ existing user FAILED");
         }
         resolve();
       }
     });
   });

   return promise;
 }
