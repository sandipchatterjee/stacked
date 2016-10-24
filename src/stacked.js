var LATESTAPIDATE = '&v=20161021';
var access_token = parseStringFromURL('#access_token=');
var resultLimit = 500;
var afterTimestamp = '1474004105';
var beforeTimestamp = '1474346105';
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

            populateFormFields("from");
            populateFormFields("to");

            loadCheckinTable(data.response);

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

// what to do on form update:
$(function() {
    var update = function() {
        var updatedFormData = $('#dateForm').serializeArray()
                                            .reduce(function(fullMap, miniMap) { 
                                                        fullMap[miniMap.name] = miniMap.value;
                                                        return fullMap;
                                                    },
                                                {});
        console.log(updatedFormData);
        var startDate = toEpoch(updatedFormData.fromYear, updatedFormData.fromMonth, 1);
        console.log(startDate);
        var endDate = toEpoch(updatedFormData.toYear, updatedFormData.toMonth, 1);
        console.log(endDate);

        if (endDate > startDate) {
            console.log('success');
        }
        else {
            console.log('From date of '+toDate(startDate)+' is AFTER end date of '+toDate(endDate));
        }
    };
    update();
    $('#dateForm').change(update);
})

function populateFormFields(prefix) {
    dateRangeForm = d3.select('#'+prefix+'DateRangeForm');
    d3.select('#'+prefix+'Date')
        .append('h4')
        .text(prefix);

    fromDateFormMonth = d3.select('#'+prefix+'DateMonth')
                        .append('select')
                        .attr('class', 'form-control')
                        .attr('name', prefix+'Month');;
    for (var i = 0; i < 12; i++) {
        fromDateFormMonth.append('option')
                            .attr('value', i)
                            .text(monthMap[i]);
    }
    fromDateFormYear = d3.select('#'+prefix+'DateYear')
                            .append('select')
                            .attr('class', 'form-control')
                            .attr('name', prefix+'Year');
    years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];
    for (var i = 0; i < years.length; i++) {
        fromDateFormYear.append('option')
                            .attr('value', years[i])
                            .text(years[i]);
    }
}

function loadCheckinTable(response) {
    var checkinItems = response.checkins.items;
    var maxDisplayed = 10;

    checkinTable = d3.select('#checkin-table');
    header = checkinTable.append('thead');
    row = header.append('tr');

    row.append('th')
       .text('Venue');
    row.append('th')
       .text('Date');

    tableBody = checkinTable.append('tbody');
    for (var i = 0; i < maxDisplayed; i++) {
        row = tableBody.append('tr');
        row.append('td')
           .text(checkinItems[i].venue.name)
        checkInDate = toDate(checkinItems[i].createdAt);
        row.append('td')
           .text(monthMap[checkInDate.getMonth()] + ' ' + checkInDate.getFullYear());
    }
    if (checkinItems.length > maxDisplayed) {
        row = tableBody.append('tr');
        row.append('td')
           .text('...')
        row.append('td')
           .text('');
    }
}

function toDate(epochTime, correction=0) {
    return new Date((+epochTime + correction)*1000);
}

function toEpoch(year=2016, month=11, day=1) {
    var dateObj = new Date(year,month,day);
    return Math.floor(dateObj.getTime()/1000)
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