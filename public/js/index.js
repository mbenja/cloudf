let current_file_data = [];
let current_path;
let files_div = document.getElementById("files");
$.when(refreshData()).done(populateDirectoryListing("/root"));


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

function uploadFile(){

}

function downloadFile(){

}

function createDirectory(){

}

function refreshData(){

  let callback = $.Deferred();

  // ajax call to backend here
  current_file_data = dummy_data;
  callback.resolve();

  return callback.promise();

}
