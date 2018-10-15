let current_file_data = [];
let files_div = document.getElementById("files");
$.when(refreshData()).done(populateDirectoryListing("/root"));


function populateDirectoryListing(path){
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

  for(let i = 0; i < files_in_path.length; i++){
    let cur_type = current_file_data[i].metadata.content_type;

    let file_card = document.createElement('div');
    if(cur_type == "parent"){
      file_card.setAttribute("class", "card parent");
    }
    else if(cur_type == "directory"){
      file_card.setAttribute("class", "card directory");
    }
    else{
      file_card.setAttribute("class", "card file");
    }

    let card_body = document.createElement('div');
    card_body.setAttribute("class", "card-body");

    let file_icon = document.createElement('img');
    file_icon.setAttribute("src", "../images/icons/" + icons_map[cur_type]);
    file_icon.setAttribute("class", "file_icon");
    card_body.appendChild(file_icon);

    let file_name = document.createElement('span');
    file_name.innerHTML = files_in_path[i].filename;
    card_body.appendChild(file_name);

    file_card.appendChild(card_body);

    files_div.appendChild(file_card);
  }
}

function populateBreadcrumbs(){

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
