var access_token = parseStringFromURL('#access_token=');
if (access_token) {
    $.ajax({
        url:'https://api.foursquare.com/v2/users/self/checkins?' + 'oauth_token=' + access_token
            + '&v=20161021',
        success: function(data) {

            // print entire response for now
            console.log(data.response);
            var names = getAllCheckinNames(data.response);
        },
        error: function(jqXHR, textStatus, e) {
            console.error(e);
        }
    });
} else {
    client_id = 'MFEBTBYZ0ED2DBCS04NWC25CTMO0FVN5GWYYEGWV2SF4GHBG';
    redirect_uri = 'http://localhost:8000/src/';
    auth_url = 'https://foursquare.com/oauth2/authenticate?client_id=' + client_id + '&response_type=token&redirect_uri=' + redirect_uri;
    $('#connection').html('<a href="' + auth_url + '" target="_new"><img src="connect4sq.png" alt="Connect to Foursquare"></a>');
}

function parseStringFromURL(prefix='/') {
    var currentLocation = window.location.href;
    var startPosition = currentLocation.indexOf(prefix);
    if (startPosition > 0) {
        return currentLocation.slice(startPosition + prefix.length);
    }
    else {
        return false
    }
}

function getAllCheckinNames(data_response) {
    dataElement = d3.select('#data');
    var venueName;
    var checkinNames = [];
    var checkins = data_response.checkins.items;
    console.log(checkins.length);
    for (var i = 0; i < checkins.length; i++) {
        venueName = checkins[i].venue.name;
        console.log(venueName);
        dataElement.append('p')
               .text(venueName);
        checkinNames.push(venueName);
    }

    return checkinNames;
}