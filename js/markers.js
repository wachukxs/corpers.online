var university = L.divIcon({className: 'fas fa-university fa-2x'});

// you can set .my-div-icon styles in CSS
L.marker([5.524986, 7.497182], {icon: university}).addTo(mymap);



//pppppp

L.geoJSON(yes, {
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {icon: university});
    }
}).addTo(mymap);