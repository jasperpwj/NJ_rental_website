$('#nav-login').hide();
$('#nav-new').hide();

$('#usersEditForm').submit((event) => {
    let hasError = false;
    $('#pwError').hide();
    event.preventDefault();
    const re = /^\w+$/;

    if(!$('#pw').val() && !$('#mail').val() && !$('#phoneNum').val()) {
        hasError = true;
    }

    if($('#pw').val()){
        if($('#pw').val() !== $('#pw2').val()){
            hasError = true;
            $('#pwError').show();
            $('#pwError').html('Error: Please check that you\'ve entered and confirmed your password!');
        }else if(!re.test($('#pw').val())) {
            hasError = true;
            $('#pwError').show();
            $('#pwError').html('Error: Password must contain only letters, numbers and underscores!');
        }else if($('#pw').val().length < 6) {
            hasError = true;
            $('#pwError').show();
            $('#pwError').html('Error: Password must contain at least six characters!');
        }else {
            const pw = $('#pw').val().toLowerCase();
            if($('#pw').val() === pw){
                hasError = true;
                $('#pwError').show();
                $('#pwError').html('Error: Password must contain at least one uppercase letter (A-Z)!');
            }
        }
    }

    if(!hasError){
        $('#usersEditForm').submit();
    }
})


// let userEditForm = document.getElementById("usersEditForm");
// let password = document.getElementById("pw");
// let password2 = document.getElementById("pw2");
// let passwordError = document.getElementById("pwError");
// let email = document.getElementById("mail");
// let phoneNumber = document.getElementById("phoneNum");

// if(userEditForm){
//     userEditForm.addEventListener('submit', (event) => {
//         let hasError = false;
//         passwordError.hidden = true;
//         event.preventDefault();
//         const re = /^\w+$/;
//         if(!password.value && !email.value && ! phoneNumber.value){
//             hasError = true;
//         }
//         if(password.value){
//             if(password.value !== password2.value){
//                 hasError = true;
//                 passwordError.hidden = false;
//                 passwordError.innerHTML = 'Error: Please check that you\'ve entered and confirmed your password!';
//             }
//             else if(!re.test(password.value)){
//                 hasError = true;
//                 passwordError.hidden = false;
//                 passwordError.innerHTML = 'Error: Password must contain only letters, numbers and underscores!';
//             } 
//             else if(password.value.length < 6){
//                 hasError = true;
//                 passwordError.hidden = false;
//                 passwordError.innerHTML = 'Error: Password must contain at least six characters!';
//             } 
//             else {
//                 const pw = password.value.toLowerCase();
//                 if(password.value === pw){
//                     hasError = true;
//                     passwordError.hidden = false;
//                     passwordError.innerHTML = 'Error: Password must contain at least one uppercase letter (A-Z)!';
//                 }
//             }
//         }
//         if(!hasError){
//             userEditForm.submit();
//         }
//     });
// }