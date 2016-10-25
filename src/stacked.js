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

    populateFormFields("from");
    populateFormFields("to");

} else {
    client_id = 'MFEBTBYZ0ED2DBCS04NWC25CTMO0FVN5GWYYEGWV2SF4GHBG';
    redirect_uri = 'http://localhost:8000/src/';
    auth_url = 'https://foursquare.com/oauth2/authenticate?client_id=' + client_id + '&response_type=token&redirect_uri=' + redirect_uri;
    $('#connection').html('<a href="' + auth_url + '" target="_new"><img src="connect4sq.png" alt="Connect to Foursquare"></a>');
}

// what to do on form update:
$(function() {
    function update() {
        var updatedFormData = $('#dateForm').serializeArray()
                                            .reduce(function(fullMap, miniMap) { 
                                                        fullMap[miniMap.name] = miniMap.value;
                                                        return fullMap;
                                                    },
                                                {});
        console.log(updatedFormData);
        var startDate = toEpoch(updatedFormData.fromYear, updatedFormData.fromMonth, 1);
        if (updatedFormData.toMonth == 1) {
            // february, not accounting for leap years
            lastDay = 28;

        } else if (updatedFormData.toMonth < 7) {
            // January through July
            if (updatedFormData.toMonth % 2 == 0) {
                // odd months (Jan/March/May/July) -- remember that the month cal is 0-indexed
                lastDay = 31;
            } else {
                // even months only (except Feb, which was removed earlier)
                lastDay = 30;
            }
        } else {
            // August through December
            if (updatedFormData.toMonth % 2 == 0) {
                // odd months (Sep/Nov) -- remember that the month cal is 0-indexed
                lastDay = 30;
            } else {
                // Aug/Oct/Dec
                lastDay = 31;
            }
        }

        var endDate = toEpoch(updatedFormData.toYear, updatedFormData.toMonth, lastDay);

        if (endDate >= startDate) {
            console.log('success');
            d3.selectAll('select').classed('form-control-red', false);
            if (access_token) {
                queryCheckinAPI(access_token, startDate, endDate);
            }
        }
        else {
            d3.selectAll('select').classed('form-control-red', true);
            console.log('From date of '+toDate(startDate)+' is AFTER end date of '+toDate(endDate));
        }
    };
    update();
    $('#dateForm').change(update);
})

function queryCheckinAPI(access_token, afterTimestamp, beforeTimestamp) {
    $.ajax({
        url:'https://api.foursquare.com/v2/users/self/checkins?' + 'oauth_token=' + access_token
            + LATESTAPIDATE
            + '&afterTimestamp=' + afterTimestamp
            + '&beforeTimestamp='+ beforeTimestamp
            + '&limit=500',
        success: function(data) {

            // print entire response for now
            console.log(data.response);

            loadCheckinTable(data.response);
            createVenueCatHist(data.response);
        },
        error: function(jqXHR, textStatus, e) {
            console.error(e);
        }
    });
}

function populateFormFields(prefix) {
    dateRangeForm = d3.select('#'+prefix+'DateRangeForm');
    d3.select('#'+prefix+'Date')
        .append('h4')
        .text(prefix);

    fromDateFormMonth = d3.select('#'+prefix+'DateMonth')
                        .append('select')
                        .attr('class', 'form-control')
                        .attr('name', prefix+'Month');
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
    checkinTable.html('');
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

function createVenueCatHist(dataResponse) {
    var freqs = {};
    var checkins = dataResponse.checkins.items;
    console.log(checkins);
    for (var i = 0; i < checkins.length; i++) {
        categories = checkins[i].venue.categories
        for (var j = 0; j < categories.length; j++) {
            category = categories[j].name;
            if (category in freqs) {
                freqs[category] += 1;
            } else {
                freqs[category] = 1;
            }
        }
    }

    console.log(freqs);
    
    return freqs
}