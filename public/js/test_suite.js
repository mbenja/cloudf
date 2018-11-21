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

  result = testGetRootDirectory();
  console.log("getRootDirectory: " + result);

  result = testGetSubDirectory();
}

/**
  * Testing getRootDirectory
*/
function testGetRootDirectory() {
  refreshData();
  if (current_file_data.length != 0) {
    return "PASSED";
  } else {
    return "FAILED";
  }
}

/**
  * Testing getSubdirectory
*/
function testGetSubDirectory() {
  // define data object for back-end
  const obj = {
    user_id: 'Mo190PgQtcI6FyRF3gNAge8whXhdtRMx',
    subdirectory: 'test'
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
