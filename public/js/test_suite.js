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

  testGetRootDirectory();
  testGetSubDirectory();
  testCreateDirectory();
  testDeleteDirectory();
  testDeleteFile();
  testUploadFile();
  testUploadDirectory();
  testEditName();
  testMoveFile();
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
    current_path: current_path,
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
    directory_path: current_file_data[index]["metadata"]["path"]
    // directory_path: current_file_data[index]["metadata"]["path"] + '/' +
    // current_file_data[index]["filename"]
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
  * Testing editFileName
  */
function testEditName() {
  var new_name = "TEST EDIT NAME";
  var selected_index = 0;
  // gather all documents that will need their path edited
  var ids = [];
  var paths = [];
  var compare_path = current_file_data[selected_index]["metadata"]["path"] + '/' + current_file_data[selected_index]["filename"];
  ids.push(current_file_data[selected_index]["_id"]);
  paths.push(current_file_data[selected_index]["metadata"]["path"].replace(current_file_data[selected_index]["metadata"]["filename"], new_name));
  for (var i = 0; i < current_file_data.length; i++) {
    if (current_file_data[i]["metadata"]["path"].includes(compare_path)) {
      ids.push(current_file_data[i]["_id"]);
      paths.push(current_file_data[i]["metadata"]["path"].replace(current_file_data[selected_index]["filename"], new_name));
    }
  }
  // define object to be sent to back-end
  const obj = {
    documents: current_file_data,
    ids: ids,
    paths: paths,
    new_name: new_name
  };
  // perform ajax call
  $.ajax({
    url: '/FileInteraction/changeName',
    data: obj,
    success: function(response) {
      if (response == 'NAME ALREADY EXISTS') {
        console.log("editFileName: " + "FAILED");
      } else if (response == 'BROKEN PIPE') {
        console.log("editFileName: " + "FAILED");
      } else {
        console.log("editFileName: " + "PASSED");
        // refresh front-end
        refreshData();
      }
    },
    error: function(response) {
      checkInvalidSession(response);
      console.log("editFileName: " + "FAILED");
     }
  });
}

/**
  * Testing move files
  */
function testMoveFile() {
  var source_index = 1;
  var destination_index = 0;
  var source_path;
  var destination_path;
  // will be zero if breadcrumb
  if (destination_index == -1) {
    destination_path = document.getElementById(ev.target.id).getAttribute("path");
  } else {
    destination_path = current_file_data[destination_index]["metadata"]["path"] +
    '/' + current_file_data[destination_index]["filename"];
  }
  source_path = current_file_data[source_index]["metadata"]["path"];
  // find all items to be moved
  // build paths array
  var source_ids = [];
  var paths = [];
  for (var i = 0; i < current_file_data.length; i++) {
    if (current_file_data[i]["metadata"]["path"].includes(source_path + '/' + current_file_data[source_index]["filename"])) {
      source_ids.push(current_file_data[i]["_id"]);
      paths.push(current_file_data[i]["metadata"]["path"].replace(source_path, destination_path));
    }
  }
  // include item itself
  source_ids.push(current_file_data[source_index]["_id"]);
  paths.push(current_file_data[source_index]["metadata"]["path"].replace(source_path, destination_path));
  // define object for back end
  const obj = {
    documents: current_file_data,
    source_ids: source_ids,
    paths: paths
  };
  // perform ajax call
  $.ajax({
    url: '/FileInteraction/moveFiles',
    data: obj,
    success: function (response) {
      // show snackbar dependent upon response
      if (response == 'BROKEN PIPE') {
        console.log("moveFile: " + "FAILED");
      } else {
        // refresh front-end
        refreshData();
        console.log("moveFile: " + "PASSED");
      }
    },
    error: function (data) {
      console.log("moveFile: " + "FAILED");
    }
  });
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
