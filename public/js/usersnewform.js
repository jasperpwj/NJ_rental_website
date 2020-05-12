$('#usersNewForm').submit((event) => {
    let hasError = false;

    $('#usernameError').hide();
    $('#passwordError').hide();
    $('#emailError').hide();
    $('#phoneNumError').hide();

    event.preventDefault();

    // check username
    if(!$('#username').val()) {
        hasError = true;
        $('#usernameError').show();
        $('#usernameError').html('Error: Please check that you\'ve entered an username');
    } else if($('#username').val().length < 6) {
        hasError = true;
        $('#usernameError').show();
        $('#usernameError').html('Error: Username must contain at least six characters!');
    }

    // check password
    const re = /^\w+$/;
    if(!$('#password').val() || !$('#password2').val() || $('#password').val() !== $('#password2').val()) {
        hasError = true;
        $('#passwordError').show();
        $('#passwordError').html('Error: Please check that you\'ve entered and confirmed your password!');
    } else if(!re.test($('#password').val())){
        hasError = true;
        $('#passwordError').show();
        $('#passwordError').html('Error: Password must contain only letters, numbers and underscores!');
    } else if($('#password').val().length < 6){
        hasError = true;
        $('#passwordError').show();
        $('#passwordError').html('Error: Password must contain at least six letters!');
    } else {
        const pw = $('#password').val().toLowerCase();
        if($('#password').val() === pw){
            hasError = true;
            $('#passwordError').show();
            $('#passwordError').html('Error: Password must contain at least one uppercase letter (A-Z)!');
        }
    }

    // check email
    if(!$('#email').val()){
        hasError = true;
        $('#emailError').show();
        $('#emailError').html('Error: Please check that you\'ve entered an email!');
    }

    // check phone number
    if(!$('#phoneNumber').val()) {
        hasError = true;
        $('#phoneNumError').show();
        $('#phoneNumError').html('Error: Please check that you\'ve entered a phone number!');
    }

    // submit without error
    if(!hasError){
        $('#userNewForm').submit();
    }
})


// let userNewForm = document.getElementById("usersNewForm");

// let username = document.getElementById("username");
// let password = document.getElementById("password");
// let password2 = document.getElementById("password2");;
// let email = document.getElementById("email");
// let phoneNumber = document.getElementById("phoneNumber");

// let usernameError = document.getElementById("usernameError");
// let passwordError = document.getElementById("passwordError");
// let emailError = document.getElementById("emailError");
// let phoneNumError = document.getElementById("phoneNumError");

// if(userNewForm){
//     userNewForm.addEventListener('submit', (event) => {
//         let hasError = false;
        
//         usernameError.hidden = true;
//         passwordError.hidden = true;
//         emailError.hidden = true;
//         phoneNumError.hidden = true;

//         event.preventDefault();
//         // check username
//         if(!username.value){
//             hasError = true;
//             usernameError.hidden = false;
// 			usernameError.innerHTML = 'Error: Please check that you\'ve entered an username';
//         } else if(username.value.length < 6){
//             hasError = true;
//             usernameError.hidden = false;
//             usernameError.innerHTML = 'Error: Username must contain at least six characters!';
//         }
//         // check password
//         const re = /^\w+$/;
//         if(!password.value || !password2.value || password.value !== password2.value){
//             hasError = true;
//             passwordError.hidden = false;
// 			passwordError.innerHTML = 'Error: Please check that you\'ve entered and confirmed your password!';
//         } else if(!re.test(password.value)){
//             hasError = true;
//             passwordError.hidden = false;
//             passwordError.innerHTML = 'Error: Password must contain only letters, numbers and underscores!';
//         } else if(password.value.length < 6){
//             hasError = true;
//             passwordError.hidden = false;
//             passwordError.innerHTML = 'Error: Password must contain at least six letters!';
//         } else {
//             const pw = password.value.toLowerCase();
//             if(password.value === pw){
//                 hasError = true;
//                 passwordError.hidden = false;
//                 passwordError.innerHTML = 'Error: Password must contain at least one uppercase letter (A-Z)!';
//             }
//         }
//         // check email
//         if(!email.value){
//             hasError = true;
//             emailError.hidden = false;
// 			emailError.innerHTML = 'Error: Please check that you\'ve entered an email';
//         }
//         // check phone number
//         if(!phoneNumber.value){
//             hasError = true;
//             phoneNumError.hidden = false;
// 			phoneNumError.innerHTML = 'Error: Please check that you\'ve entered a phone number';
//         }
//         if(!hasError){
//             userNewForm.submit();
//         }
//     });
// }