const email_input = document.getElementById('input_login_email');
const password_input = document.getElementById('input_login_password');
let last_error;

//bcrypt

function doLogin(form){

  let promise = new Promise((resolve, reject) => {

    $.ajax({
      url: '/authenticate/initiateLogin',
      data: {email: email_input.value,
             password: password_input.value},
      success: (response) => {
        if(response.success){
          resolve(response.session_id);
        }
        else{
          last_error = response.error;
          console.log(response.error);
          reject(response.error);
        }
      },
    });

  }).then((session_id) => {
    console.log("success");
    console.log(session_id);
    document.cookie = "cloudf_session="+session_id+";max-age=3600";
    console.log(document.cookie);
    alert("Login Successful, session id " + session_id);
    form.submit();
  }, (error) => {
    console.log("failure");
    console.log(error);
    $.snackbar({content: "<strong>Error:</strong> " + error + "."});
  });


  return false;

}
