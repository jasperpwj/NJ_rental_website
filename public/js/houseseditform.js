// $('#nav-login').hide();
// $('#nav-new').hide();

// $('#housesEditForm').submit((event) => {
//     event.preventDefault();
//     $('#editFormError').hide();

//     if(!$('#editStatement').val() && !$('#editType').val() && !$('#editPrice').val()) {
//         $('#editFormError').show();
//         $('#editFormError').html('Error: Please enter something to edit your house information!');
//         return;
//     }else {
//         $('#housesEditForm').submit();
//     }
// })

// $('#housesEditImgForm').submit((event) => {
//     event.preventDefault();
//     $('editImgError').hide();
    
//     if($('#img').val()) {
//         const arr = $('#img').val().split('.');
//         if(arr[arr.lenth - 1] === 'jpg' || arr[arr.length - 1] === 'png') {
//             $('#housesEditImgForm').submit();
//         }else {
//             $('#editImgError').show();
//             $('#editImgError').html('Error: The file could only be image(jpg, png) format!');
//         }
//     }else {
//         $('#editImgError').show();
//         $('#editImgError').html('Error: Please check that you\'ve choosen an image file!');
//     }
// })



let housesEditForm = document.getElementById('housesEditForm');
let statement = document.getElementById('editStatement');
let type = document.getElementById('editType');
let price = document.getElementById('editPrice');
let editFormError = document.getElementById('editFormError');

let housesEditImgForm = document.getElementById('housesEditImgForm');
let img = document.getElementById('img');
let editImgError = document.getElementById('editImgError');



if(housesEditForm){
    housesEditForm.addEventListener('submit', (event) => {
        event.preventDefault();
        editFormError.hidden = true;

        if(!statement.value && !type.value && !price.value){
            editFormError.hidden = false;
            editFormError.innerHTML = 'Error: Please enter something to edit your house information!';
            return;
        } 
        else {
            housesEditForm.submit();
        }
    });
}

if(housesEditImgForm){
    housesEditImgForm.addEventListener('submit', (event) => {
        event.preventDefault();
        editImgError.hidden = true;

        if(img.value){
            const arr = img.value.split('.');
            if(arr[arr.length - 1] === 'jpg' || arr[arr.length - 1] === 'png'){
                housesEditImgForm.submit();
            } else {
                editImgError.hidden = false;
                editImgError.innerHTML = 'Error: The file could only be image(jpg png) format!';
            }
        } else {
            editImgError.hidden = false;
            editImgError.innerHTML = 'Error: Please check that you\'ve choosen an image file!';
        }
    });
}
