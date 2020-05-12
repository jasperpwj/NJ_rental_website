let form = document.getElementById('housesSingleForm');
let comment = document.getElementById('comment');

//new by JP
let signIn = document.getElementById("nav-login");
let signUp = document.getElementById("nav-new");
let slideNum = 1;

signIn.hidden = true;
signUp.hidden = true;
showSlides(slideNum);

function nextSlides(n) {
    showSlides( slideNum += n);
}

function currentSlide(n) {
    showSlides(slideNum = n);

}
function showSlides (n){
    let i;
    let slides = document.getElementsByClassName("mySlides");
    if (n > slides.length) {slideNum = 1}
    if (n < 1) {slideNum = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[slideNum-1].style.display = "block";
}

if(form){
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if(comment.value){
            form.submit();
        }
    });
}

// $('#housesSingleForm').submit((event) => {
//     event.preventDefault();
//     if($('#comment').val()){
//         $('#housesSingleForm').submit();
//     }
// })
