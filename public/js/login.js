const email_input = document.getElementById('input_login_email');
const password_input = document.getElementById('input_login_password');
const reg_email_input = document.getElementById('reg_email_input');
const reg_pass_input1 = document.getElementById('reg_pass_input1');
const reg_pass_input2 = document.getElementById('reg_pass_input2');
let last_error;

//bcrypt

function doLogin(form, email, pass){

  $.ajax({
    url: '/authenticate/initiateLogin',
    data: {email: email,
           password: pass}
  }).then(
    (session_id) => {
      console.log("success");
      console.log(session_id);
      Cookies.set('cloudf_session', session_id, {expires: 1/24});
      // document.cookie = "cloudf_session="+session_id+";max-age=3600";
      form.submit();
    },
    (error) => {
      console.log("failure");
      console.log(error.responseText);
      $.snackbar({content: "<strong>Error:</strong> " + error.responseText + "."});
    }
  );

}



function registerUser(form){

  if(reg_pass_input1.value != reg_pass_input2.value){
    $.snackbar({content: "<strong>Error:</strong> Passwords must match!"});
    return;
  }
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
      doLogin(form, reg_email_input.value, reg_pass_input1.value);
    },
    (error) => {
      console.log("reg failure");
      console.log(error.responseText);
      $.snackbar({content: "<strong>Error:</strong> " + error.responseText + "."});
    }
  );

}
