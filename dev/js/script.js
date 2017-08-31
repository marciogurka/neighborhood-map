var initialPlaceMarkers = [
    {
        lat: '40.748441',
        lng: '-73.985664'
    },
    {
        lat: '40.781324',
        lng: '-73.973988'
    },
    {
        lat: '40.699294',
        lng: '-74.041579'
    },
    {
        lat: '40.711794',
        lng: '-74.013349'
    },
    {
        lat: '40.733879',
        lng: '-73.970288'
    }
];

var foursquareCredentials = {
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET'
};

var googleMapsPlaceMarkers = [];
var placeMarkers = [];

var pg_marker = {lat: 40.712784, lng: -74.005941};

var map;

// Create a single infowindow to be used with the place details information
// so that only one is open at once.
var placeInfoWindow;

// This function will loop through the places and list them.
function populateList(places) {
    googleMapsPlaceMarkers = [];
    places.forEach(function (place) {
        googleMapsPlaceMarkers.push(place);
    });
}

// This function will loop through the listings and hide them all.
function hideMarkers(markers) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

function triggerClickMarker(place){
    placeMarkers.forEach(function (marker) {
        if(place.geometry.location.lat() == marker.position.lat() && place.geometry.location.lng() == marker.position.lng())
            google.maps.event.trigger(marker, 'click');
    })
}


// This function creates markers for each place found in either places search.
function createMarkersForPlaces(places) {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < places.length; i++) {
        var place = places[i];
        var marker = new google.maps.Marker({
            map: map,
            title: place.name,
            position: place.geometry.location,
            id: place.place_id,
            animation: google.maps.Animation.DROP
        });


        google.maps.event.addListener(placeInfoWindow, 'closeclick', function () {
            marker.setAnimation(null);
        });

        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                if (marker.getAnimation() != null) {
                    marker.setAnimation(null);
                    placeInfoWindow.close();
                } else {
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    getPlacesDetails(this, placeInfoWindow);
                }
            };
        })(marker, i));

        placeMarkers.push(marker);

        if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(place.geometry.location);
        }
    }
    map.fitBounds(bounds);
}

// This is the PLACE DETAILS search - it's the most detailed so it's only
// executed when a marker is selected, indicating the user wants more
// details about that place.
function getPlacesDetails(marker, infowindow) {
    var date = new Date();
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();
    var version = [date.getFullYear(), (mm>9 ? '' : '0') + mm, (dd>9 ? '' : '0') + dd].join('');

    var data = {
        ll: marker.position.lat() + ',' + marker.position.lng(),
        client_id: foursquareCredentials.clientId,
        client_secret: foursquareCredentials.clientSecret,
        v: version
    };
    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/search',
        method: 'GET',
        data: data,
        success: successCallForsquare,
        error: errorCallForsquare
    });

    var placeName;

    function successCallForsquare(data) {
        var venues = data.response.venues;
        if(venues.length){
            placeName = venues[0].name;
        }
    }

    function errorCallForsquare(data) {
        window.alert('Não foi possível obter algumas informações sobre o local')
    }

    var service = new google.maps.places.PlacesService(map);
    service.getDetails({
        placeId: marker.id
    }, function (place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Set the marker property on this infowindow so it isn't created again.
            infowindow.marker = marker;
            var innerHTML = '<div>';
            if (placeName) {
                innerHTML += '<strong>' + placeName + '</strong>';
            } else if (place.name) {
                innerHTML += '<strong>' + place.name + '</strong>';
            }
            if (place.formatted_address) {
                innerHTML += '<br>' + place.formatted_address;
            }
            if (place.formatted_phone_number) {
                innerHTML += '<br>' + place.formatted_phone_number;
            }
            if (place.opening_hours) {
                innerHTML += '<br><br><strong>Hours:</strong><br>' +
                    place.opening_hours.weekday_text[0] + '<br>' +
                    place.opening_hours.weekday_text[1] + '<br>' +
                    place.opening_hours.weekday_text[2] + '<br>' +
                    place.opening_hours.weekday_text[3] + '<br>' +
                    place.opening_hours.weekday_text[4] + '<br>' +
                    place.opening_hours.weekday_text[5] + '<br>' +
                    place.opening_hours.weekday_text[6];
            }
            if (place.photos) {
                innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
                    {maxHeight: 100, maxWidth: 200}) + '">';
            }
            innerHTML += '</div>';
            infowindow.setContent(innerHTML);
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
            });
        } else {
            window.alert('Details for a place failed due to: ' + status);
        }
    });
}


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: pg_marker
    });

    placeInfoWindow = new google.maps.InfoWindow();

    var geocoder = new google.maps.Geocoder();

    initialPlaceMarkers.forEach(function (marker, index) {
        var latlng = {lat: parseFloat(marker.lat), lng: parseFloat(marker.lng)};
        geocoder.geocode({'location': latlng}, function (results, status) {
            if (status === 'OK') {
                if (results.length) {
                    googleMapsPlaceMarkers.push(results[0]);
                }
            } else {
                window.alert('Geocoder failed due to: ' + status);
            }
            if (index === initialPlaceMarkers.length - 1) {
                createMarkersForPlaces(googleMapsPlaceMarkers);
                populateList(googleMapsPlaceMarkers);
                ko.applyBindings(App);
            }
        });
    });
}

var App = {
    address: ko.observable(''),
    query: ko.observable(''),
    showPlace: function (place) {
        var places = [place];
        hideMarkers(placeMarkers);
        createMarkersForPlaces(places);
        triggerClickMarker(place);
    }
};

App.placesList = ko.dependentObservable(function () {
    var search = this.query().toLowerCase();
    if (search) {
        hideMarkers(placeMarkers);
        var result = ko.utils.arrayFilter(googleMapsPlaceMarkers, function (marker) {
            return marker.formatted_address.toLowerCase().indexOf(search) >= 0;
        });
        createMarkersForPlaces(result);
        return result;
    } else {
        if (typeof google != "undefined") {
            hideMarkers(placeMarkers);
            createMarkersForPlaces(googleMapsPlaceMarkers);
        }
        return googleMapsPlaceMarkers;
    }
}, App);


function showError(){
    window.alert("Erro carregando a biblioteca do Google Maps!");
}