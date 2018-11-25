/**
 * email login input of the user
 * @type {Object}
 */
const email_input = document.getElementById('input_login_email');

/**
 * password login input of the user
 * @type {Object}
 */
const password_input = document.getElementById('input_login_password');

/**
 * email registration input of the user
 * @type {Object}
 */
const reg_email_input = document.getElementById('reg_email_input');

/**
 * password registration input of the user
 * @type {Object}
 */
const reg_pass_input1 = document.getElementById('reg_pass_input1');

/**
 * re-entered password registration input of the user
 * @type {Object}
 */
const reg_pass_input2 = document.getElementById('reg_pass_input2');



// do initial check - if the user is already logged in, redirect to main page
$.ajax({
  url: '/authenticate/checkLogin',
}).then(
  () => {
    // if success from checking login, redirect to main page
    window.location.replace("..");
  }
);




/**
 * does user login based on entered credentials
 * @param {String} email email of the user
 * @param {String} pass password of the user
 */
function doLogin(email, pass){

  $.ajax({
    url: '/authenticate/initiateLogin',
    data: {email: email,
           password: pass}
  }).then(
    (session_id) => {
      // redirect to main page
      window.location.replace("..");
    },
    (error) => {
      $.snackbar({content: "<strong>Error:</strong> " + error.responseText + "."});
    }
  );

}


/**
 * does user registration based on entered credentials
 */
function registerUser(){

  // if the passwords don't match, show an error
  if(reg_pass_input1.value != reg_pass_input2.value){
    $.snackbar({content: "<strong>Error:</strong> Passwords must match!"});
    return;
  }
  // if the paswords aren't long enough, show an error
  if(reg_pass_input1.value.length < 8){
    $.snackbar({content: "<strong>Error:</strong> Passwords must be 8 characters!"});
    return;
  }

  $.ajax({
    url: '/authenticate/register',
    data: {email: reg_email_input.value,
           password: reg_pass_input1.value}
  }).then(
    () => {
      // login the user if registration was successful
      doLogin(reg_email_input.value, reg_pass_input1.value);
    },
    (error) => {
      $.snackbar({content: "<strong>Error:</strong> " + error.responseText + "."});
    }
  );

}
