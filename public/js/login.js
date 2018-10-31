const email_input = document.getElementById('input_login_email');
const password_input = document.getElementById('input_login_password');


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
          console.log(response.error);
          reject(response.error);
        }
      },
    });

  }).then((session_id) => {
    console.log("success");
    alert("Login Successful, session id " + session_id);
    form.submit();
  }, (error) => {
    console.log("failure");
    $.snackbar({content: "<strong>Error:</strong> " + error.code + "."});
  });


  return false;

}
