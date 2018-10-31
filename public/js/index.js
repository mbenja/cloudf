/**
 * stores an array of all the file data received in the last query of the database
 * @type {Array}
 */
let current_file_data = [];

/**
 * stores path currently being viewed by the user
 * @type {String}
 */
let current_path = '/root';


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



// initial call to backend to get file data
refreshData();



/**
 * removes all of the currently displayed files and instead displays those found
 * in the given path string. does NOT refresh file data from the database.
 * @param {String} path directory path to show files in
 */
function populateDirectoryListing(path){

  // update current path
  current_path = path;

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
    // set css class and onlick attributes based on file type
    if(cur_type == "parent"){
      file_card.setAttribute("class", "card parent");
      file_card.setAttribute("onclick", "populateDirectoryListing(\"" + current_path.split('/').splice(0, current_path.split('/').length-1).join('/') + "\");");
    }
    else if(cur_type == "directory"){
      file_card.setAttribute("class", "card directory");
      file_card.setAttribute("ondblclick", "is_single=0;populateDirectoryListing(\"" + path + "/" + files_in_path[i].filename + "\");");
      file_card.setAttribute("onclick", "is_single=1;setTimeout(function() { if (is_single) showSidebar(" + files_in_path[i].index + ");},300);");
    }
    else{
      file_card.setAttribute("class", "card file");
      // set onclick event to show sidebar
      file_card.setAttribute("onclick", "showSidebar(" + files_in_path[i].index + ");")
    }

    // create body for file type image and name
    let card_body = document.createElement('div');
    card_body.setAttribute("class", "card-body");

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
          //block_to_insert.addEventListener("click", populateDirectoryListing(this.path))
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
 * displays the file information sidebar
 * @param {Number} index index of the file to show in current_file_data
 */
function showSidebar(index) {
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
}



/**
 * Sends necessary data to back-end for call to delete file
 */
function deleteFile() {
  // update state variables in back-end
  sendState();
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
      $('#modal_delete_file').modal('hide');
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
    error: function (data) {
      console.log(data);
    }
  });
}



/**
 * Sends necessary data to back-end for call to download file
 */
function downloadFile() {
  // update state variables in back-end
  sendState();
  // define object to be sent to back-end
  const obj = {
    file_id: current_file_data[selected_index]["_id"],
    file_name: current_file_data[selected_index]["filename"]
  };
  // making call to back-end
  window.open('/FileInteraction/downloadFile?file_id=' + obj.file_id + '&file_name=' + obj.file_name);
  // hide sidebar
  hideSidebar();
}

function editFileName(){

}



/**
 * Retrieves necessary data from user to perform back-end call to upload file
 */
function sendState() {
  // define data needed on backend
  // TODO this is hard-coded until we implement user authentication
  const obj = {
    user_id: 'Mo190PgQtcI6FyRF3gNAge8whXhdtRMx',
    current_path: current_path
  };
  // perform ajax call
  $.ajax({
    url: '/FileInteraction/clientState',
    data: obj,
    success: function (data) {
      //console.log(data);
    },
    error: function (data) {
      console.log(data);
    }
  });
}



/**
 * Performs back-end call to create a directory in MongoDB
 */
function createDirectory() {
  // send state
  sendState();

  // get data for back-end
  // account for empty folder name
  var directory_name = document.getElementById('input_directory_name').value;
  if (directory_name == '') {
    directory_name = 'New Folder';
  }
  const obj = {
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

  const obj = {
    user_id: 'Mo190PgQtcI6FyRF3gNAge8whXhdtRMx'
  };
  // perform ajax call
  $.ajax({
    url: '/FileInteraction/getRootDirectory',
    data: obj,
    success: function (data) {
      // present error if broken pipe
      if (data == 'BROKEN PIPE') {
        $.snackbar({content: "<strong>Error:</strong> Servers are down."});
      } else {
        current_file_data = data.map((val, ind) => { val.index = ind; return val; });
        populateDirectoryListing('/root');
      }
      callback.resolve();
    },
    error: function (data) {
      console.log(data);
      callback.reject();
    }
  });
  // call to send client state
  sendState();

  return callback.promise();

}



/**
 * Defining on submit for upload_form so that we can handle on complete, etc.
 */
$('#upload_form').submit(function(e){
  // prevents rerouting of page
  e.preventDefault();

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
        // refresh front-end
        refreshData();
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
  return false;
});
