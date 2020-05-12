$('#nav-logout').hide();
$('#nav-profile').hide();

$('#usersLoginForm').submit((event) => {
    $('#loginError').hide();
    event.preventDefault();
    let hasError = false;

    if(!$('#name').val() || !$('#pword').val()) {
        $('#spinner').show();
        hasError = true;
        $('#loginError').show();
        $('#loginError').html('Error: Please check that you\'ve entered your username and password!');
    }

    if(!hasError) {
        $('#usesLoginForm').submit();
    }
})

// let usersLoginForm = document.getElementById("usersLoginForm");
// let username = document.getElementById("name");
// let password = document.getElementById("pword");
// let loginError = document.getElementById("loginError");

// if(usersLoginForm){
//     usersLoginForm.addEventListener('submit', (event) => {
//         loginError.hidden = true;
//         event.preventDefault();
//         if(!username.value || !password.value){
//             loginError.hidden = false;
//             loginError.innerHTML = 'Error: Please check that you\'ve entered your username and password!';
//         }
//         if(loginError.hidden){
//             usersLoginForm.submit();
//         }
//     });
// }