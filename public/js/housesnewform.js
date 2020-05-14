let form = document.getElementById('housesNewForm');
let houseNewMap = document.getElementById('houseNewMap');
let addrDiv = document.getElementById('addrDiv');
let judgeDiv = document.getElementById('judgeDiv');
let nextDiv = document.getElementById('nextDiv');

let statement = document.getElementById('statement');
let type = document.getElementById('type');
let price = document.getElementById('price');
let image = document.getElementById('image');
let formError = document.getElementById('formError');

let latlng;

document.getElementById('back').addEventListener('click', function() {
    addrDiv.hidden = false;
    judgeDiv.hidden = true;
    nextDiv.hidden = true;
});
document.getElementById('next').addEventListener('click', function() {
    addrDiv.hidden = true;
    judgeDiv.hidden = true;
    houseNewMap.hidden = true;
    nextDiv.hidden = false;
});
document.getElementById('backToAddr').addEventListener('click', function() {
    addrDiv.hidden = false;
    judgeDiv.hidden = true;
    houseNewMap.hidden = false;
    nextDiv.hidden = true;
});

function initMap() {
    const map = new google.maps.Map(houseNewMap, {
        zoom: 12,
        center: {lat: 40.728157, lng: -74.077644} // jersey city lat lng
    });
    const geocoder = new google.maps.Geocoder();
    document.getElementById('check').addEventListener('click', function() {
        geocodeAddress(geocoder, map);
    });
}

function geocodeAddress(geocoder, resultsMap) {
    const address = document.getElementById('address').value;
    if(address !== ""){
        geocoder.geocode({'address': address}, function(results, status) {
            if (status === 'OK') {
                latlng = results[0].geometry.location;
                resultsMap.zoom = 18;
                resultsMap.setCenter(latlng);
                new google.maps.Marker({
                    map: resultsMap,
                    position: latlng
                });

                judgeDiv.hidden = false;
                addrDiv.hidden = true;
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }
}

if(form){
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        formError.hidden = true;
        if(latlng !== undefined){
            document.getElementById('lat').value = latlng.lat();
            document.getElementById('lng').value = latlng.lng();
        }
        if(!statement.value || !type.value || !price.value || !image.value){
            formError.hidden = false;
            formError.innerHTML = 'Error: Please make sure that every field is filled and an image is choosen!';
            return;
        }
        else {
            const arr = image.value.split('.');
            if(arr[arr.length - 1] !== 'jpg' && arr[arr.length - 1] !== 'png'){
                formError.hidden = false;
                formError.innerHTML = 'Error: The file could only be image(jpg, png) format!';
                return;
            }
        }
        form.submit();
    });
}

// let latlng;

// $('#back').click(() => {
//     $('#addrDiv').show();
//     $('#judgeDiv').hide();
//     $('#nextDiv').hide();
// });

// $('#next').click(() => {
//     $('#addrDiv').hide();
//     $('#judgeDiv').hide();
//     $('#houseNewMap').hide();
//     $('#nextDiv').show();
// });

// $('#backToAddr').click(() => {
//     $('#addrDiv').show();
//     $('#judgeDiv').hide();
//     $('#houseNewMap').show();
//     $('#nextDiv').hide();
// });

// function initMap() {
//     const map = new google.maps.Map($('#houseNewMap'), {
//         zoom: 12,
//         center: {lat: 40.728157, lng: -74.077644} // jersey city lat lng
//     });
//     const geocoder = new google.maps.Geocoder();
//     $('#check').click(() => {
//         geocodeAddress(geocoder, map);
//     });
// }

// function geocodeAddress(geocoder, resultsMap) {
//     const address = $('#address').val();
//     if(address !== ""){
//         geocoder.geocode({'address': address}, (results, status) => {
//             if (status === 'OK') {
//                 latlng = results[0].geometry.location;
//                 resultsMap.zoom = 18;
//                 resultsMap.setCenter(latlng);
//                 new google.maps.Marker({
//                     map: resultsMap,
//                     position: latlng
//                 });

//                 $('#addrDiv').hide();
//                 $('#judgeDiv').show();
//             } else {
//                 alert('Geocode was not successful for the following reason: ' + status);
//             }
//         });
//     }
// }

// $('#housesNewForm').submit((event) => {
//     event.preventDefault();
//     $('#formError').hide();
//     if(latlng !== undefined) {
//         $('#lat').val() = latlng.lat();
//         $('#lng').val() = latlng.lng();
//     }

//     if(!$('#statement').val() || !$('#type').val() || !$('#price').val() || !$('#image').val()) {
//         $('#formError').show();
//         !$('#formError').html('Error: Please make sure that every field is filled and an image is choosen!');
//         return;
//     }else {
//         const arr = $('#image').val().split('.');
//             if(arr[arr.length - 1] !== 'jpg' && arr[arr.length - 1] !== 'png'){
//                 $('#formError').show();
//                 !$('#formError').html('Error: The file could only be image(jpg, png) format!');
//                 return;
//             }
//     }
//     $('#housesNewForm').submit();
// })
