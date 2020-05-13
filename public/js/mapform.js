let allHouses = JSON.parse(document.getElementById('allHouses').value);
let map;
let infoObj;

let sortForm = document.getElementById('sortForm');
let sort = document.getElementById('sort');
let searchForm = document.getElementById('searchForm');
let search = document.getElementById('search');
let low = document.getElementById('low');
let high = document.getElementById('high');

let login = document.getElementById('nav-login');
let logout = document.getElementById('nav-logout');
let signUp = document.getElementById('nav-new');
let profile = document.getElementById('nav-profile');
let usr = $('#usr').text();

if(usr === 'true') {
    login.hidden = true;
    signUp.hidden = true;
    logout.hidden = false;
    profile.hidden = false;

} else {
    login.hidden = false;
    signUp.hidden = false;
    logout.hidden = true;
    profile.hidden = true;
}



if(sortForm){
    sortForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if(sort.value === ""){
            return;
        }
        sortForm.submit();
    });
}
if(searchForm){
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if(!search.value && !low.value && !high.value){
            return;
        }
        if((low.value && !high.value) || ((!low.value && high.value))){
            return;
        }
        if(Number(low.value) > Number(high.value)){
            return;
        }
        searchForm.submit();
    });
}

window.onload = function (){
    this.initMap();
};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 40.728157, lng: -74.077644} // jersey city lat lng
    });

    var icon = {
        url: '/public/img/icon.png',
        scaledSize: new google.maps.Size(50, 30), // scaled size
        origin: new google.maps.Point(0,0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };

    for (let i = 0; i < allHouses.length; i++) {
        const latlng = {lat: allHouses[i].lat, lng: allHouses[i].lng};
        
        const marker = new google.maps.Marker({
            position: latlng,
            map: map,
            icon: icon,
            label: {
                text: '$'+ allHouses[i].price +'',
                fontFamily: 'Open Sans',
                fontWeight: 'bold',
                fontSize: '16px',
                color: 'white'
            }
        });

        const id = allHouses[i]._id + "";
        const contentString = 
        allHouses[i].images[0]?
            '<div class="infoWindow">'+
            '<div><img class="infoImg" src="/houses/image/'+ allHouses[i].images[0] +'"></div>' +
            '<div><a href="/houses/'+ id +'">'+ allHouses[i].houseInfo +'</a></div>' +
            '<div>'+ allHouses[i].roomType +'</div>' +
            '<div>$'+ allHouses[i].price + ' / month</div>'
            +'</div>'
        :
            '<div class="infoWindow">'+
            '<div><a href="/houses/'+ id +'">'+ allHouses[i].houseInfo +'</a></div>' +
            '<div>'+ allHouses[i].roomType +'</div>' +
            '<div>$'+ allHouses[i].price + ' / month</div>'
            +'</div>'
        ;

        const infoWindow = new google.maps.InfoWindow({
            content: contentString
        });

        marker.addListener('click', function() {
            if(infoObj !== undefined){
                infoObj.set('marker', null);
                infoObj.close();
                infoObj.length = 0;
            }
            infoWindow.open(map, marker);
            infoObj = infoWindow;
            map.panTo(this.position);
        });
    }
}