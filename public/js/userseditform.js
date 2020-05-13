let userEditForm = document.getElementById("usersEditForm");
let password = document.getElementById("pw");
let password2 = document.getElementById("pw2");
let passwordError = document.getElementById("pwError");
let email = document.getElementById("mail");
let phoneNumber = document.getElementById("phoneNum");

if(userEditForm){
    userEditForm.addEventListener('submit', (event) => {
        let hasError = false;
        passwordError.hidden = true;
        event.preventDefault();
        const re = /^\w+$/;
        if(!password.value && !email.value && ! phoneNumber.value){
            hasError = true;
        }
        if(password.value){
            if(password.value !== password2.value){
                hasError = true;
                passwordError.hidden = false;
                passwordError.innerHTML = 'Error: Please check that you\'ve entered and confirmed your password!';
            }
            else if(!re.test(password.value)){
                hasError = true;
                passwordError.hidden = false;
                passwordError.innerHTML = 'Error: Password must contain only letters, numbers and underscores!';
            } 
            else if(password.value.length < 6){
                hasError = true;
                passwordError.hidden = false;
                passwordError.innerHTML = 'Error: Password must contain at least six characters!';
            } 
            else if(password.value.length > 16){
                hasError = true;
                passwordError.hidden = false;
                passwordError.innerHTML = 'Error: Password must contain at most sixteen characters!';
            } 
            else {
                const pw = password.value.toLowerCase();
                if(password.value === pw){
                    hasError = true;
                    passwordError.hidden = false;
                    passwordError.innerHTML = 'Error: Password must contain at least one uppercase letter (A-Z)!';
                }
            }
        }
        if(!hasError){
            userEditForm.submit();
        }
    });
}