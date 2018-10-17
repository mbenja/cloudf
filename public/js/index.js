let current_file_data = [];
let current_path = '/root';
let files_div = document.getElementById("files");
//$.when(refreshData()).done(populateDirectoryListing("/root"));

// calling function to refresh data upon initial page load
refreshData();

// calling function to populate directory listing once ajax is finished
$( document ).ajaxStop(function() {
  populateDirectoryListing('/root');
});


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
      file_card.setAttribute("onclick", "populateDirectoryListing(\"" + path + "/" + files_in_path[i].filename + "\")")
    }
    else{
      file_card.setAttribute("class", "card file");
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
    console.log("Current Path: " + path);
     //Parse File Path
    for(let x = 1; x <= path.length; x++)
    {
      partialPath = partialPath + path[x];
      if(path[x] == '/')
      {
        parentCount++;
        console.log("Path number " + parentCount + "is: " + partialPath);
        partialPath = "";
      }
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

function createDirectory(){

}

/**
  * Retrieves root directory
*/
function refreshData() {
  // define data needed on backend
  // TODO this is hard-coded until we implement user authentication
  const obj = {
    user_id: 'Mo190PgQtcI6FyRF3gNAge8whXhdtRMx'
  };
  // perform ajax call
  $.ajax({
    url: '/FileInteraction/getRootDirectory',
    data: obj,
    success: function (data) {
      current_file_data = data;
    },
    error: function (data) {
      console.log(data);
    }
  });
  // call to send client state
  sendState();


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
     // present snackbar
     $.snackbar({content: "<strong>Success!</strong> Upload complete."});
    },
    error: function(response) {
      // dismiss modal
      $('#modal_upload_form').modal('hide');
      // present snackbar
      $.snackbar({content: "<strong>Error</strong> Upload was not completed."});
     }
  });
  return false;
});
