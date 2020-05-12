$('#housesSingleForm').submit((event) => {
    event.preventDefault();
    if($('#comment').val()){
        $('#housesSingleForm').submit();
    }
})


// let form = document.getElementById('housesSingleForm');
// let comment = document.getElementById('comment');

// if(form){
//     form.addEventListener('submit', (event) => {
//         event.preventDefault();
//         if(comment.value){
//             form.submit();
//         }
//     });
// }