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
      // dismiss delete modal
      $('#modal_delete').modal('hide');
      // hide sidebar
      hideSidebar();
      // show snackbar dependent upon response
      if (response == 'BROKEN PIPE') {
        console.log("deleteFile: " + "FAILED");
      } else {
        console.log("deleteFile: " + "FAILED");
        refreshData();
      }
    },
    error: function (data) {
      console.log("deleteFile: " + "FAILED");
    }
  });
}
