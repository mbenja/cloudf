let current_file_data = [];
let current_path = '/root';
let current_breadcrumb_path;
let current_breadcrumb_parents = 0;
let current_path_sections = 0;
let files_div = document.getElementById("files");
//$.when(refreshData()).done(() => { populateDirectoryListing("/root"); });

refreshData();

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
      file_card.setAttribute("onclick", "populateDirectoryListing(\"" + current_path.split('/').splice(0, current_path.split('/').length-1).join('/') + "\"); showHideDownloadDelete(false);");
    }
    else if(cur_type == "directory"){
      file_card.setAttribute("class", "card directory");
      file_card.setAttribute("onclick", "populateDirectoryListing(\"" + path + "/" + files_in_path[i].filename + "\"); showHideDownloadDelete(false);")
    }
    else{
      file_card.setAttribute("class", "card file");
      file_card.setAttribute("onclick", "showHideDownloadDelete(true)")
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

//Show Delete and Download floatingButtons
function showHideDownloadDelete(show){
  if(show) {
    document.getElementById('deleteFile').style.visibility = "visible";
    document.getElementById('downloadFile').style.visibility = "visible";
  }
  else {
    document.getElementById('deleteFile').style.visibility = "hidden";
    document.getElementById('downloadFile').style.visibility = "hidden";
  }

}



function populateSidebar(){

}

function deleteFile(){

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

function downloadFile(){

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
      } else {
        $.snackbar({content: "<strong>Success!</strong> Folder creation complete."});
      }
      // refresh front-end
      refreshData();
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
      current_file_data = data;
      populateDirectoryListing('/root');
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


  // let callback = $.Deferred();
  //
  // // ajax call to backend here
  // //current_file_data = dummy_data;
  //
  // // define data needed on backend
  // // TODO this is hard-coded until we implement user authentication
  // const obj = {
  //   user_id: 'Mo190PgQtcI6FyRF3gNAge8whXhdtRMx'
  // };
  // // perform ajax call
  // $.ajax({
  //   url: '/FileInteraction/getRootDirectory',
  //   data: obj,
  //   success: function (data) {
  //     current_file_data = data;
  //     console.log(current_file_data);
  //   },
  //   error: function (data) {
  //     console.log(data);
  //   }
  // }).done(callback.resolve);
  // // callback.resolve();
  //
  // return callback.promise();

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
      } else {
        $.snackbar({content: "<strong>Success!</strong> Upload complete."});
      }
      // refresh front-end
      refreshData();
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
