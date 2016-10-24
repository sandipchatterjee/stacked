var LATESTAPIDATE = '&v=20161021';
var access_token = parseStringFromURL('#access_token=');
var resultLimit = 500;
var afterTimestamp = '1472754105';
var beforeTimestamp = '1475346105';
var monthMap = {0: 'Jan',
                1: 'Feb',
                2: 'Mar',
                3: 'Apr',
                4: 'May',
                5: 'Jun', 
                6: 'Jul',
                7: 'Aug',
                8: 'Sep',
                9: 'Oct',
                10: 'Nov',
                11: 'Dec'
            }

if (access_token) {

    $.ajax({
        url: 'https://api.foursquare.com/v2/users/self?' + 'oauth_token=' + access_token
             + LATESTAPIDATE,
        success: function(data) {
            user = data.response.user
            d3.select('#user-data')
                .append('h4')
                .text(user.firstName + ' ' + user.lastName)
                .append('h5')
                .attr('id', 'checkinCount')
                .text(user.checkins.count + ' check-ins');
        },
        error: function(jqXHR, textStatus, e) {
            console.error(e);
        }
    });

    $.ajax({
        url:'https://api.foursquare.com/v2/users/self/checkins?' + 'oauth_token=' + access_token
            + LATESTAPIDATE
            + '&afterTimestamp=' + afterTimestamp
            + '&beforeTimestamp='+ beforeTimestamp
            + '&limit=500',
        success: function(data) {

            // print entire response for now
            console.log(data.response);
            // var names = getAllCheckinNames(data.response);
            var checkinItems = data.response.checkins.items;

            checkinTable = d3.select('#checkin-table');
            header = checkinTable.append('thead');
            row = header.append('tr');

            row.append('th')
               .text('Venue');
            row.append('th')
               .text('Date');

            tableBody = checkinTable.append('tbody');
            for (var i = 0; i < 20; i++) {
                row = tableBody.append('tr');
                row.append('td')
                   .text(checkinItems[i].venue.name)
                checkInDate = toDate(checkinItems[i].createdAt);
                row.append('td')
                   .text(monthMap[checkInDate.getMonth()] + ' ' + checkInDate.getFullYear());
            }
            if (checkinItems.length > 20) {
                row = tableBody.append('tr');
                row.append('td')
                   .text('...')
                row.append('td')
                   .text('');
            }
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

function toDate(epochTime, correction=0) {
    return new Date((+epochTime + correction)*1000);
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

function getAllCheckinNames(dataResponse) {
    var venueName;
    var checkinNames = [];
    var checkins = dataResponse.checkins.items;
    console.log(checkins.length);
    for (var i = 0; i < checkins.length; i++) {
        venueName = checkins[i].venue.name;
        checkinNames.push(venueName);
    }

    return checkinNames;
}