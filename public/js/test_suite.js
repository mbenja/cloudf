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
