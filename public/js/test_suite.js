/**
  * Calls all necessary tests for testing each portion of application
  * Test scores are updating accordingly
*/
function runTestSuite() {
  testAuth();
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

/**
 * test authentication backend functions
 */
async function testAuth(){

  //save current session cookie
  let cur_session = Cookies.get('cloudf_session');

  // create test username to user for these tests
  let testUser = 'example' + Math.floor(Math.random()*1000000) + '@example.com';

  // initially remove session cookie
  Cookies.remove('cloudf_session');
  await testNotLoggedIn();

  // set cookie to bad value for test
  Cookies.set('cloudf_session', 'exampleBadCookie')
  await testInvalidCookie();

  // test registration functions
  await testNewRegistration(testUser);
  await testExistingRegistration(testUser);

  // test login functions
  await testInvalidUsername();
  await testInvalidPassword(testUser);
  await testLogin(testUser);
  await testIsLoggedIn();

  // test logout functions
  await testLogout();
  await testLogoutNotLoggedIn();

  // reset cookies to initial user's session
  Cookies.set('cloudf_session', cur_session);
}

/**
 * test that not having a session cookie returns "NOT LOGGED IN"
 */
async function testNotLoggedIn(){

  let promise = new Promise((resolve, reject) => {
    $.ajax({
      url: '/authenticate/checkLogin',
      success: () => {
        console.log("checkLogin without session FAILED");
        resolve();
      },
      error: (error) => {
        if(error.responseText == "NOT LOGGED IN"){
          console.log("checkLogin without session PASSED");
        }
        else{
          console.log("checkLogin without session FAILED");
        }
        resolve();
      }
    })

  });

  return promise;
}

/**
 * test that having an invalid cookie returns "INVALID SESSION"
 */
async function testInvalidCookie(){

  let promise = new Promise((resolve, reject) => {
    $.ajax({
      url: '/authenticate/checkLogin',
      success: () => {
        console.log("checkLogin with invalid cookie FAILED");
        resolve();
      },
      error: (error) => {
        if(error.responseText == "INVALID SESSION"){
          console.log("checkLogin with invalid cookie PASSED");
        }
        else{
          console.log("checkLogin with invalid cookie FAILED");
        }
        resolve();
      }
    });

  });

  return promise;

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
      success: (result) => {
        if(result == "SUCCESSFUL REGISTRATION"){
          console.log("register PASSED");
        }
        else{
          console.log("register FAILED");
        }
        resolve();
      },
      error: () => {
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

/**
 * tests that the login function returns "INVALID USER" when a bad username is used
 */
async function testInvalidUsername(){
  let promise = new Promise((resolve, reject) => {
    $.ajax({
      url: '/authenticate/initiateLogin',
      data: {email: 'anIncorrectEmail@example.com',
             password: 'doesntmatter'},
      success: () => {
        console.log("login with invalid username FAILED");
        resolve();
      },
      error: (error) => {
        if(error.responseText == "INVALID USER"){
          console.log("login with invalid username PASSED");
        }
        else{
          console.log("login with invalid username FAILED");
        }
        resolve();
      }
    });
  });

  return promise;
}

/**
 * tests that the login function returns "INCORRECT PASSWORD" when the wrong password for a user is entered
 */
async function testInvalidPassword(testUser){
  let promise = new Promise((resolve, reject) => {
    $.ajax({
      url: '/authenticate/initiateLogin',
      data: {email: testUser,
             password: 'anIncorrectPassword'},
      success: () => {
        console.log("login with incorrect password FAILED");
        resolve();
      },
      error: (error) => {
        if(error.responseText == "INCORRECT PASSWORD"){
          console.log("login with incorrect password PASSED");
        }
        else{
          console.log("login with incorrect password FAILED");
        }
        resolve();
      }
    });
  });

  return promise;
}

/**
 * test that the login function returns a session id that is stored in the cookies when successful
 */
async function testLogin(testUser){
  let promise = new Promise((resolve, reject) => {
    $.ajax({
      url: '/authenticate/initiateLogin',
      data: {email: testUser,
             password: 'examplepass'},
      success: (result) => {
        console.log(result);
        if(result == Cookies.get('cloudf_session')){
          console.log("login PASSED");
        }
        else{
          console.log("login FAILED");
        }
        resolve();
      },
      error: () => {
        console.log("login FAILED");
        resolve();
      }
    });
  });

  return promise;
}

/**
 * test that the backend recognizes that a user is logged in after a successful initiateLogin call
 */
async function testIsLoggedIn(){
  let promise = new Promise((resolve, reject) => {
    $.ajax({
      url: '/authenticate/checkLogin',
      success: (result) => {
        if(result == "LOGGED IN"){
          console.log("checkLogin after login PASSED");
        }
        else{
          console.log("checkLogin after login FAILED");
        }
        resolve();
      },
      error: () => {
        console.log("checkLogin after login FAILED");
        resolve();
      }
    });
  });

  return promise;
}

/**
 * test that the logout function returns "SUCCESSFUL LOGOUT" when user is logged in
 */
async function testLogout(){
  let promise = new Promise((resolve, reject) => {
    $.ajax({
      url: '/authenticate/logout',
      success: (result) => {
        if(result == "SUCCESSFUL LOGOUT"){
          console.log("logout PASSED");
        }
        else{
          console.log("logout FAILED");
        }
        resolve();
      },
      error: () => {
        console.log("logout FAILED");
        resolve();
      }
    })
  });

  return promise;
}

/**
 * test that backend recognizes that a user is no longer logged in after a successful logout call
 */
async function testIsLoggedInAfterLogout(){
  let promise = new Promise((resolve, reject) => {
    $.ajax({
      url: '/authenticate/checkLogin',
      success: () => {
        console.log("checkLogin after logout FAILED");
        resolve();
      },
      error: (error) => {
        if(error.responseText == "NOT LOGGED IN"){
          console.log("checkLogin after logout PASSED");
        }
        else{
          console.log("checkLogin after logout FAILED");
        }
        resolve();
      }
    });
  });

  return promise;
}

/**
 * test that the logout function returns "NOT LOGGED IN" when a user is not logged in
 */
async function testLogoutNotLoggedIn(){
  let promise = new Promise((resolve, reject) => {
    $.ajax({
      url: '/authenticate/logout',
      success: () => {
        console.log("logout when not logged in FAILED");
        resolve();
      },
      error: (error) => {
        if(error.responseText == "NOT LOGGED IN"){
          console.log("logout when not logged in PASSED");
        }
        else{
          console.log("logout when not logged in FAILED");
        }
        resolve();
      }
    });
  });

  return promise;
}
