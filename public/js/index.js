let current_file_data = [];
let current_path;
let current_breadcrumb_path;
let current_breadcrumb_parents = 0;
let current_path_sections = 0;
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
