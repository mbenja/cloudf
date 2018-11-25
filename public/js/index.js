/**
 * stores an array of all the file data received in the last query of the database
 * @type {Array}
 */
let current_file_data = [];

/**
 * Current directory being uploaded by user
 * @type {String}
 */
let current_upload_path_local = '';

/**
 * stores path currently being viewed by the user
 * @type {String}
 */
let current_path;
setCurrentPath('/root');


let current_breadcrumb_path;
let current_breadcrumb_parents = 0;
let current_path_sections = 0;

/**
 * references the file display div for easy addition/removal of files
 * @type {Object}
 */
let files_div = document.getElementById("files");

/**
 * tracks the index of the file currently selected in the information sidebar
 * @type {Number}
 */
let selected_index = 0;



// display loading modal
$('#loading_modal').modal('show');
// initial call to backend to get file data, then hide modal if it succeeds
refreshData().then(() => {
  setTimeout(function() {
    $('#loading_modal').modal('hide');
  }, 500);
});



/**
 * removes all of the currently displayed files and instead displays those found
 * in the given path string. does NOT refresh file data from the database.
 * @param {String} path directory path to show files in
 */
function populateDirectoryListing(path){

  // update current path
  setCurrentPath(path);

  // remove all of the files currently displayed
  while(files_div.firstChild){
    files_div.removeChild(files_div.firstChild);
  }

  // filter the files to only show those in the current path
  let files_in_path = current_file_data.filter(val => val.metadata.path == path);

  // if we're not looking at the root directory add additional file for parent dir
  if(path != "/root"){
    files_in_path.unshift({metadata: {content_type: 'parent'}, filename: '..'})
  }

  // go though each of the files in this directory
  for(let i = 0; i < files_in_path.length; i++){
    let cur_type = files_in_path[i].metadata.content_type;

    // create enclosing div for file
    let file_card = document.createElement('div');

    //Assign File ID
    file_card.setAttribute("id", "file" + i);
    file_card.setAttribute('_id', files_in_path[i]["_id"]);

    // set css class and onlick attributes based on file type
    if(cur_type == "parent"){
      file_card.setAttribute("class", "card parent");
      file_card.setAttribute("onclick", "populateDirectoryListing(\"" + current_path.split('/').splice(0, current_path.split('/').length-1).join('/') + "\");");

      file_card.setAttribute("ondrop", "drop(event)");
      file_card.setAttribute("ondragover", "allowDrop(event)");
    }
    else if(cur_type == "directory"){
      file_card.setAttribute("class", "card directory");
      file_card.setAttribute("onclick", "populateDirectoryListing(\"" + path + "/" + files_in_path[i].filename + "\");")

      file_card.setAttribute("draggable", "true");
      file_card.setAttribute("ondragstart", "drag(event)");
      file_card.setAttribute("ondrop", "drop(event)");
      file_card.setAttribute("ondragover", "allowDrop(event)");

      file_card.setAttribute("ondblclick", "is_single=0;populateDirectoryListing(\"" + path + "/" + files_in_path[i].filename + "\");");
      file_card.setAttribute("onclick", "is_single=1;setTimeout(function() { if (is_single) showSidebar(" + files_in_path[i].index + ");},300);");
    }
    else{
      file_card.setAttribute("class", "card file");

      file_card.setAttribute("draggable", "true");
      file_card.setAttribute("ondragstart", "drag(event)");
      // set onclick event to show sidebar
      file_card.setAttribute("onclick", "showSidebar(" + files_in_path[i].index + ");")
    }

    // create body for file type image and name
    let card_body = document.createElement('div');
    card_body.setAttribute("class", "card-body");

    //Assign File ID
    card_body.setAttribute("id", "file" + i);

    // create file type image
    let file_icon = document.createElement('img');
    file_icon.setAttribute("src", "../images/icons/" + (icons_map[cur_type] ? icons_map[cur_type] : "_blank.png"));
    file_icon.setAttribute("class", "file_icon");
    card_body.appendChild(file_icon);

    // write file name
    let file_name = document.createElement('span');
    file_name.innerHTML = files_in_path[i].filename;
    card_body.appendChild(file_name);

    file_card.appendChild(card_body);

    files_div.appendChild(file_card);
  }
  //Update breadcrumb Banner
  populateBreadcrumbs(path);
}



/**
 * updates the breadcrumbs at the top of the page to display the path currentlybeing viewed.
 * @param {String} path directory path to display in breadcrumbs
 */
function populateBreadcrumbs(path){
  let partialPath = "";
    let parentCount = 0;
     //Parse File Path
     for(let x = 1; x <= path.length; x++)
     {
       if(path[x] == '/') {
         parentCount++;
       }
     }
     if(parentCount > current_breadcrumb_parents) {
     current_breadcrumb_parents = parentCount;
      //Parse File Path
       for(let x = path.length-1; x != 0; x--)
       {
         partialPath = path[x] + partialPath;
         if(path[x] == '/')
         {
          parentCount++;
          current_path_sections++;

          //add HTML block to document
          var block_to_insert ;
          var container_block ;

          block_to_insert = document.createElement( 'div' );
          block_to_insert.id = 'pathSection'+current_path_sections;
          block_to_insert.classList.add('pathSection');
          block_to_insert.path = path;
          block_to_insert.setAttribute("onclick", "populateDirectoryListing(this.path)");
          block_to_insert.setAttribute("ondrop", "drop(event)");
          block_to_insert.setAttribute("ondragover", "allowDrop(event)");
          block_to_insert.innerHTML = partialPath ;
          block_to_insert.pathNum = current_path_sections;


          container_block = document.getElementById( 'banner' );
          container_block.appendChild( block_to_insert );

          partialPath = "";
          break;
        }
      }
    }
    else if (parentCount < current_breadcrumb_parents)
    {
     let jumpParentNum = current_breadcrumb_parents - parentCount;
     for(let x=0; x<jumpParentNum; x++)
     {
       let block_to_remove = document.getElementById('pathSection'+current_path_sections);
       block_to_remove.parentNode.removeChild(block_to_remove);
       current_path_sections--;
       current_breadcrumb_parents = parentCount;

     }

    }
}

/**
 * allows the file_card to be dragged
 * @param {event} the drag event on file_card being moved
 */
 function drag(ev) {
    ev.dataTransfer.setData("id", ev.target.id);
}

/**
 * changes file_card path to new path and updates page
 * @param {event} the drop event between the folder and file_card being moved
 */
 function drop(ev) {
     ev.preventDefault();
     let id = ev.dataTransfer.getData("id");
     source_file_card = document.getElementById(id);
     destination_file_card = document.getElementById(ev.target.id);
     if(id != ev.target.id) {
      // get ids
      const source_id = source_file_card.getAttribute('_id');
      const destination_id = destination_file_card.getAttribute("_id");
      var source_index = -1;
      var destination_index = -1;
      var source_path;
      var destination_path;
      // look up in files array
      for (var i = 0; i < current_file_data.length; i++) {
        if (current_file_data[i]["_id"] == source_id) {
          source_index = i;
        }
        if (current_file_data[i]["_id"] == destination_id) {
          destination_index = i;
        }
      }
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
            $.snackbar({content: "<strong>Error:</strong> Servers are down."});
          } else {
            // refresh front-end
            refreshData();
          }
        },
        error: function (data) {
          console.log(data);
        }
      });
    }
 }

 /**
  * allows drop event to occur on folder
  * @param {event} the div that is having drop event occur on it
  */
 function allowDrop(ev) {
     ev.preventDefault();
 }


/**
 * displays the file information sidebar
 * @param {Number} index index of the file to show in current_file_data
 */
function showSidebar(index) {
  showEditFileName('hide');
  selected_index = index;
  populateSidebar(index);
  document.getElementById("file_sidebar").removeAttribute('disabled');
  document.getElementById("main_container").setAttribute('small', true);
}



/**
 * removes the file information sidebar from the page
 */
function hideSidebar() {
  document.getElementById("file_sidebar").setAttribute('disabled', true);
  document.getElementById("main_container").removeAttribute('small');
}



/**
 * populates the file information sidebar with data about the file in the given index
 * @param {Number} index index of the file whose information to display
 */
function populateSidebar(index){
  document.getElementById("data-filename").innerHTML = current_file_data[index].filename;
  document.getElementById("data-filetype").innerHTML = current_file_data[index].metadata.content_type;
  document.getElementById("data-adddate").innerHTML = current_file_data[index].metadata.date_added;
  if(current_file_data[index].metadata.shared_by){
    document.getElementById("data-sharedby").innerHTML = "Shared By:<br>" + current_file_data[index].metadata.shared_by;
  }
  else{
    document.getElementById("data-sharedby").innerHTML = "";
  }
}

/**
 * Sends necessary data to back-end for call to delete file
 */
function deleteItem() {
  // update state variables in back-end
  //sendState();
  // check content type
  if (current_file_data[selected_index]["metadata"]["content_type"] == "directory") {
    // is directory
    // define object to be sent to back-end
    const obj = {
      directory_id: current_file_data[selected_index]["_id"],
      directory_path: current_file_data[selected_index]["metadata"]["path"] + '/' +
      current_file_data[selected_index]["filename"]
    };
    // perform ajax call
    $.ajax({
      url: '/FileInteraction/deleteDirectory',
      data: obj,
      success: function (response) {
        // dismiss delete modal
        $('#modal_delete').modal('hide');
        // hide sidebar
        hideSidebar();
        // show snackbar dependent upon response
        if (response == 'BROKEN PIPE') {
          $.snackbar({content: "<strong>Error:</strong> Servers are down."});
        } else {
          $.snackbar({content: "<strong>Success!</strong> The folder has been deleted."});
          // refresh front-end
          refreshData();
        }
      },
      error: (data) => { checkInvalidSession(data); }
    });
  } else {
    // is file
    // define object to be sent to back-end
    const obj = {
      file_id: current_file_data[selected_index]["_id"]
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
          $.snackbar({content: "<strong>Error:</strong> Servers are down."});
        } else {
          $.snackbar({content: "<strong>Success!</strong> The file has been deleted."});
          // refresh front-end
          refreshData();
        }
      },
      error: (data) => { checkInvalidSession(data); }
    });
  }
}



/**
 * Sends necessary data to back-end for call to download file/directory
 */
function download() {
  // update state variables in back-end
  //sendState();
  // check content_type
  // define object to be sent to back-end
  if (current_file_data[selected_index]["metadata"]["content_type"] == "directory") {
    // is directory
    const obj = {
      directory_id: current_file_data[selected_index]["_id"],
      directory_name: current_file_data[selected_index]["filename"],
      directory_path: current_file_data[selected_index]["metadata"]["path"] + '/' +
      current_file_data[selected_index]["filename"]
    };
    // making call to back-end
    window.open('/FileInteraction/downloadDirectory?directory_id=' + obj.directory_id +
    '&directory_name=' + obj.directory_name + '&directory_path=' + obj.directory_path);
  } else {
    // is singular file
    const obj = {
      file_id: current_file_data[selected_index]["_id"],
      file_name: current_file_data[selected_index]["filename"]
    };
    // making call to back-end
    window.open('/FileInteraction/downloadFile?file_id=' + obj.file_id + '&file_name=' + obj.file_name);
    // window.open('/FileInteraction/downloadFile?file_id=' + obj.file_id + '&file_name=' + obj.file_name + '&session=' + Cookies.get('cloudf_session'));
  }
  // hide sidebar
  hideSidebar();
}

function showEditFileName(status) {
  let filename = document.getElementById('data-filename');
  let filenameInput = document.getElementById('data-filename-input');

  if(status == 'show') {
    filenameInput.style.display = "block";
    filename.style.display = "none";
  }
  else {
    filenameInput.style.display = "none";
    filename.style.display = "block";
  }

}

function editFileName(){
  let filenameInput = document.getElementById('data-filename-input');
  let filename = document.getElementById('data-filename');

  showEditFileName('show');

  filenameInput.addEventListener("keyup", function(event) {
    event.preventDefault();
    if(event.keyCode === 13) {
      filename.innerHTML = filenameInput.value;
      showEditFileName('hide');
      // gather all documents that will need their path edited
      var ids = [];
      var paths = [];
      var compare_path = current_file_data[selected_index]["metadata"]["path"] + '/' + current_file_data[selected_index]["filename"];
      ids.push(current_file_data[selected_index]["_id"]);
      paths.push(current_file_data[selected_index]["metadata"]["path"].replace(current_file_data[selected_index]["metadata"]["filename"], filenameInput.value));
      for (var i = 0; i < current_file_data.length; i++) {
        if (current_file_data[i]["metadata"]["path"].includes(compare_path)) {
          ids.push(current_file_data[i]["_id"]);
          paths.push(current_file_data[i]["metadata"]["path"].replace(current_file_data[selected_index]["filename"], filenameInput.value));
        }
      }
      // define object to be sent to back-end
      const obj = {
        documents: current_file_data,
        ids: ids,
        paths: paths,
        new_name: filenameInput.value
      };
      // perform ajax call
      $.ajax({
        url: '/FileInteraction/changeName',
        data: obj,
        success: function(response) {
          // show snackbar dependent upon response
          if (response == 'NAME ALREADY EXISTS') {
            $.snackbar({content: "<strong>Error:</strong> An item of that name already exists within this directory."});
          } else if (response == 'BROKEN PIPE') {
            $.snackbar({content: "<strong>Error:</strong> Servers are down."});
          } else {
            $.snackbar({content: "<strong>Success!</strong> Name change complete."});
            // refresh front-end
            refreshData();
          }
        },
        error: function(response) {
          checkInvalidSession(response);
          // present snackbar
          $.snackbar({content: "<strong>Error:</strong> Name change was not completed."});
         }
      });
    }
  });
}

/**
 * Retrieves necessary data from user to perform back-end call to upload file
 */
// function sendState() {
//   // define data needed on backend
//   // TODO this is hard-coded until we implement user authentication
//   const obj = {
//     user_id: 'Mo190PgQtcI6FyRF3gNAge8whXhdtRMx',
//     current_path: current_path,
//     current_upload_path_local: current_upload_path_local
//   };
//   // perform ajax call
//   $.ajax({
//     url: '/FileInteraction/clientState',
//     data: obj,
//     success: function (data) {
//       //console.log(data);
//     },
//     error: function (data) {
//       console.log(data);
//     }
//   });
// }



/**
 * Performs back-end call to create a directory in MongoDB
 */
function createDirectory() {
  // send state
  //sendState();

  // get data for back-end
  // account for empty folder name
  var directory_name = document.getElementById('input_directory_name').value;
  if (directory_name == '') {
    directory_name = 'New Folder';
  }
  const obj = {
    current_path: current_path,
    directory_name: directory_name
  };
  // perform ajax call
  $.ajax({
    url: '/FileInteraction/createDirectory',
    data: obj,
    success: function(response) {
      // dismiss modal upon success
      $('#modal_create_directory').modal('hide');
      // show snackbar dependent upon response
      if (response == 'DIRECTORY ALREADY EXISTS') {
        $.snackbar({content: "<strong>Error:</strong> A folder of that name already exists within this directory."});
      } else if (response == 'BROKEN PIPE') {
        $.snackbar({content: "<strong>Error:</strong> Servers are down."});
      } else {
        $.snackbar({content: "<strong>Success!</strong> Folder creation complete."});
        // refresh front-end
        refreshData();
      }
    },
    error: function(response) {
      checkInvalidSession(response);
      // dismiss modal
      $('#modal_create_directory').modal('hide');
      // present snackbar
      $.snackbar({content: "<strong>Error:</strong> Folder creation was not completed."});
     }
  });
  // reset input
  document.getElementById("input_directory_name").value = "";
}



/**
 * Retrieves root directory
 * @returns {Promise} a promise that is resolved/rejected when the backend responds with file data or an error
 */
function refreshData() {
  // define data needed on backend
  // TODO this is hard-coded until we implement user authentication

  let callback = $.Deferred();

  // const obj = {
  //   user_id: 'Mo190PgQtcI6FyRF3gNAge8whXhdtRMx'
  // };
  // perform ajax call
  $.ajax({
    url: '/FileInteraction/getRootDirectory',
    success: function (data) {
      // present error if broken pipe
      if (data == 'BROKEN PIPE') {
        $.snackbar({content: "<strong>Error:</strong> Servers are down."});
      } else {
        current_file_data = data.map((val, ind) => { val.index = ind; return val; });
        populateDirectoryListing(current_path);
      }
      console.log(data);
      callback.resolve();
    },
    error: function (data) {
      checkInvalidSession(data);
      //console.log("error:" + data);
      callback.reject();
    }
  });
  // call to send client state
  //sendState();

  return callback.promise();

}


/**
 * On change listener for upload directory form so that back-end can know name of
 * folder that is being uploaded
 */
document.getElementById("input_upload_directory").addEventListener("change", function(event) {
  let files = event.target.files;
  console.log(files);
  var directory = files[0].webkitRelativePath;
  directory = directory.split('/');
  // find any subdirectories and build associated paths
  var subdirectories = [];
  var paths = [];
  subdirectories.push(directory);
  paths.push(current_path);
  for (var i = 0; i < files.length; i++) {
    paths.push(files[i].webkitRelativePath.replace('/' + files[i].name, ''));
    var relative_path = files[i].webkitRelativePath;
    relative_path = relative_path.split('/');
    console.log(relative_path);
    if (relative_path.length > 2) {
      // has subdirectory
      for (var j = 1; j < relative_path.length; j += 2) {
        // only include unique ones
        if (!subdirectories.includes(relative_path[j])) {
          subdirectories.push(relative_path[j]);
        }
      }
    }
  }
  console.log(subdirectories);
  console.log(paths);
  // setCurrentUploadPathLocal(directory[0]);
  setCurrentUploadPathLocal(subdirectories, paths);
  //setCurrentPath(current_path + '/' + current_upload_path_local);
  //sendState();
}, false);


/**
 * checks the data returned from a request to see if there was an authentication error
 * if there was an authenticaion error, redirect to the login page
 * if there wasn't, update the cookies to refersh the current session for another hour
 * @param {Object} data data returns from an ajax request
 */
function checkInvalidSession(data){
  //alert(data.responseText);
  if(data.responseText == 'INVALID SESSION' || data.responseText == 'NOT LOGGED IN'){
    window.location.replace("/login");
    return;
  }
}


/**
 * Defining on submit for upload_form so that we can handle on complete, etc.
 */
$('#upload_form').submit(function(event) {
  // prevents rerouting of page
  event.preventDefault();

  // serialize the form
  var form_data = $('#upload_form').serialize();
  // submit the form
  $(this).ajaxSubmit({
    data: form_data,
    contentType: 'application/json',
    success: function(response) {
      // dismiss modal upon success
      $('#modal_upload_form').modal('hide');
      // show snackbar dependent upon response
      if (response == 'FILE ALREADY EXISTS') {
        $.snackbar({content: "<strong>Error:</strong> A file of that name already exists within this directory."});
      } else if (response == 'BROKEN PIPE') {
        $.snackbar({content: "<strong>Error:</strong> Servers are down."});
      } else {
        $.snackbar({content: "<strong>Success!</strong> Upload complete."});
        // purge upload directory
        $.ajax({
          url: '/FileInteraction/purgeUploadDirectory',
          success: function (data) {
            // present error if broken pipe
            if (data == 'BROKEN PIPE') {
              $.snackbar({content: "<strong>Error:</strong> Servers are down."});
            }
          },
          error: function (data) {
            checkInvalidSession(data);
          }
        });
        // refresh front-end
        refreshData();
      }
    },
    error: function(response) {
      checkInvalidSession(response);
      // dismiss modal
      $('#modal_upload_form').modal('hide');
      // present snackbar
      $.snackbar({content: "<strong>Error:</strong> Upload was not completed."});
     }
  });
  // reset input
  document.getElementById("input_upload_file").value = "";
  document.getElementById("input_upload_directory").value = "";
  return false;
});

$('#upload_form_directory').submit(function(event) {
  // prevents rerouting of page
  event.preventDefault();

  // serialize the form
  var form_data = $('#upload_form').serialize();

  // submit the form
  $(this).ajaxSubmit({
    data: form_data,
    contentType: 'application/json',
    success: function(response) {
      // dismiss modal upon success
      $('#modal_upload_form').modal('hide');
      // show snackbar dependent upon response
      if (response == 'FILE ALREADY EXISTS') {
        $.snackbar({content: "<strong>Error:</strong> A file of that name already exists within this directory."});
      } else if (response == 'DIRECTORY ALREADY EXISTS') {
        $.snackbar({content: "<strong>Error:</strong> A folder of that name already exists within this directory."});
      } else if (response == 'BROKEN PIPE') {
        $.snackbar({content: "<strong>Error:</strong> Servers are down."});
      } else {
        $.snackbar({content: "<strong>Success!</strong> Upload complete."});
        // refresh front-end
        //setCurrentPath(current_path + '/' + current_upload_path_local);
        setCurrentUploadPathLocal("");
        refreshData();
        // purge upload directory
        $.ajax({
          url: '/FileInteraction/purgeUploadDirectory',
          success: function (data) {
            // present error if broken pipe
            if (data == 'BROKEN PIPE') {
              $.snackbar({content: "<strong>Error:</strong> Servers are down."});
            }
          },
          error: function (data) {
            checkInvalidSession(data);
          }
        });
      }
    },
    error: function(response) {
      // dismiss modal
      $('#modal_upload_form').modal('hide');
      // present snackbar
      $.snackbar({content: "<strong>Error:</strong> Upload was not completed."});
     }
  });
  // reset input
  document.getElementById("input_upload_file").value = "";
  document.getElementById("input_upload_directory").value = "";
  return false;
});


/**
 * updates the path the user is currently viewing
 * @param {String} new_path the updated path
 */
function setCurrentPath(new_path){
  // update path variable
  current_path = new_path;
  // update the upload file action path so that the current path gets passed along with the upload request
  document.getElementById('upload_form').setAttribute('action', '/FileInteraction/uploadFile?current_path=' + current_path);
  document.getElementById('upload_form_directory').setAttribute('action', '/FileInteraction/uploadDirectory?current_path=' + current_path + "&current_upload_path_local=" + current_upload_path_local);
}

function setCurrentUploadPathLocal(new_path, paths){
  current_upload_path_local = new_path;
  document.getElementById('upload_form_directory').setAttribute('action', '/FileInteraction/uploadDirectory?current_path=' + current_path + "&directories=" + current_upload_path_local + '&paths=' + paths);
}


/**
 * makes an ajax call to logout the user
 * redirect to the login page if the logout was successful.
 */
function doLogout(){
  $.ajax({url: '/authenticate/logout',
          success: (data) => {
            if(data == 'SUCCESSFUL LOGOUT'){
              window.location.replace("/login");
            }
            else{
              $.snackbar({content: "<strong>Error:</strong> Logout failed, please try again."});
            }
          }
  });
}

let email_share_input = document.getElementById('emailShareInput');

/**
 * shares the currently selected item with the user entered in the email box
 */
function shareItem(){

  if(current_file_data[selected_index].metadata.content_type == "directory"){
    const obj = {
      directory_id: current_file_data[selected_index]["_id"],
      directory_name: current_file_data[selected_index].filename,
      directory_path: current_file_data[selected_index].metadata.path,
      share_with: email_share_input.value
    };

    $.ajax({
      url: '/FileInteraction/shareDirectory',
      data: obj,
      success: () => {
        hideSidebar();
        $('#modal_share').modal('hide');
        email_share_input.value = "";
        $.snackbar({content: "Shared file successfully!"});
      },
      error: (response) => {
        console.log(response);
        $.snackbar({content: "<strong>Error:</strong> " + response.responseText});
      }
    });
  }
  else{
    // singular file
    const obj = {
      file_id: current_file_data[selected_index]["_id"],
      file_name: current_file_data[selected_index].filename,
      content_type: current_file_data[selected_index].content_type,
      share_with: email_share_input.value
    }

    $.ajax({
      url: '/FileInteraction/shareFile',
      data: obj,
      success: () => {
        hideSidebar();
        $('#modal_share').modal('hide');
        email_share_input.value = "";
        $.snackbar({content: "Shared file successfully!"});
      },
      error: (response) => {
        console.log(response);
        $.snackbar({content: "<strong>Error:</strong> " + response.responseText});
      }
    });
  }
}
