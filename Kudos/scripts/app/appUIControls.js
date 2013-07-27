/*********************************************/
/* Marketing Script*/
/*********************************************/
var DE = DE || {};
$(document).ready(function () {
    'use strict';
    // Get the browser height and width
    var windowHeight, windowWidth;
    windowHeight = $(window).height();
    windowWidth = $(window).width();
    var stateList = ["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MH", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "PW", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "V", "VT", "WA", "WI", "WV", "WY"];
    var initializeBlockUI = function () {
        $.blockUI.defaults.message = "<h3>Please Wait...</h3>";
        return $.blockUI.defaults.css = {
            border: "none",
            padding: "15px",
            backgroundColor: "#000",
            "-webkit-border-radius": "10px",
            "-moz-border-radius": "10px",
            opacity: 0.8,
            color: "#fff",
            margin: 0,
            width: '30%',
            top: '40%',
            left: '35%',
            textAlign: 'center',
            cursor: 'wait'
        };
    };
    initializeBlockUI();

    $('.dropdown-toggle').dropdown();

    $(document).on("keyup", function (e) {
        if (e.keyCode == 13) {
            if ($("#loginSection").length) {
                $("#inputPassword").blur(); // hack for stupid IE
                $("#loginSubmit").click();
            }
            if ($("#legalAcknowledgement").length) {
                $("#btnAccept").click();
            }
        }
    });

    $('.typeahead').typeahead({
        source: function (query, process) {
            var temp = ["Ross Jennings", "Victore Diaz", "James Marsh"];
            return temp;
        }
    });

    $("#commentPopover").hide();

    $('[rel=popover]').popover({ 
        html : true, 
        content: function() {
            return $('#commentPopover').html();
        }
    });

    // Sets the modal argumnets
    $('#search-modal').modal({
        backdrop: true,
        keyboard: true,
        show: false
    });
    // Paginate the dashbaord fundings widget
    if ($('#dashboard-widget-fundings').length) {
        $('#dashboard-widget-fundings').pajinate({
            'items_per_page': 3,
            'item_container_id': '.deck-items',
            'nav_panel_id': '.pagination',
            'wrap_around': true
        });
    }
    if ($('#dashboard-widget-applications').length) {
        $('#dashboard-widget-applications').pajinate({
            'items_per_page': 3,
            'item_container_id': '.deck-items',
            'nav_panel_id': '.pagination',
            'wrap_around': true
        });
    }
    if ($('#dashboard-widget-leads').length) {
        $('#dashboard-widget-leads').pajinate({
            'items_per_page': 3,
            'item_container_id': '.deck-items',
            'nav_panel_id': '.pagination',
            'wrap_around': true
        });
    }
    // Adds a datepicker to input fields
    window.prettyPrint && prettyPrint();
    if ($('.start-date').length) {
        $('.start-date').datepicker({ autoclose: true });
    }
    if ($('.end-date').length) {
        $('.end-date').datepicker({ autoclose: true });
    }
    if ($('#appointmentDatepicker').length) {
        $('#appointmentDatepicker').datepicker({ autoclose: true, startDate: '0d', weekStart: '0', setWeekendDisabled: false });
    }
    if ($('#appointmentTimepicker').length) {
        $('#appointmentTimepicker').timepicker({ 'minTime': minTime(), 'maxTime': '9:00pm' });
    }
    if ($('#dp3').length) {
        $('#dp3').datepicker();
    }
    if ($('#dp4').length) {
        $('#dp4').datepicker();
    }
    if ($('#dpYears').length) {
        $('#dpYears').datepicker();
    }
    if ($('#dpYears').length) {
        $('#dpYears').datepicker();
    }
    if ($('#dpYears').length) {
        $('#dpYears').datepicker();
    }
    var myDate = new Date();
    var prettyDate = ('0' + (myDate.getMonth() + 1)).slice(-2) + '/' + ('0' + myDate.getDate()).slice(-2) + '/' + myDate.getFullYear();
    $("input.today").val(prettyDate);
    var startDate = new Date(2012, 1, 20);
    var endDate = new Date(2012, 1, 25);
    $('.start-date').datepicker().on('changeDate', function (ev) {
        if (ev.date.valueOf() > endDate.valueOf()) {
            $('#alert').show().find('strong').text('The start date can not be greater then the end date');
        } else {
            $('#alert').hide();
            startDate = new Date(ev.date);
            $('#startDate').text($('.start-date').data('date'));
        }
    });
    $('.end-date').datepicker().on('changeDate', function (ev) {
        if (ev.date.valueOf() < startDate.valueOf()) {
            $('#alert').show().find('strong').text('The end date can not be less then the start date');
        } else {
            $('#alert').hide();
            endDate = new Date(ev.date);
            $('#endDate').text($('.end-date').data('date'));
        }
    });
    $('#appointmentDatepicker').datepicker().on('changeDate', function (ev) {
        $('#selectedDate').val($('#appointmentDatepicker').val()).trigger('change');
    });
    // Set the initial height of the sidebar deck
    $('.slide-deck-column').height(windowHeight);
    // Initialize filtering of the deck items
    $('#filter-vehicles').fastLiveFilter('#vehicle-inventory');
    $('#filter-inventory').fastLiveFilter('#inventory');
    /*
    * If the browser is less than 767 wide (our tablet breaking point)
    * then hide the sidebar and make it inactive
    */
    if (windowWidth < 767) {
        $('body').removeClass('sidebar-active');
        $('#sidebar').animate({
            marginLeft: '-280px'
        }, 'fast');
        $('#main-container').animate({
            marginLeft: '0px'
        }, 'fast');
        $('.hide-deck').hide();
        $('.show-deck').show();
    }

    if ($("#page-header .page-title").text() === "Fundings") {
        $("#decision").css({ "display": "block" });
    }

    // Opens or closes dealer disclosure
    $(".open-disclosure").click(function () {
        $('.disclosure').show();
    });
    $(".close-disclosure").click(function () {
        $('.disclosure').hide();
    });
    // Enable help tooltips
    var isVisible = false;
    var clickedAway = false;
    $('a[rel=popover]').popover({
        html: true,
        trigger: 'manual'
    }).click(function (e) {
        $(this).popover('show');
        $(this).addClass('active');
        clickedAway = false
        isVisible = true
        e.preventDefault()
    });

    if ($("#appDetails").length) {
        $('.deck-item i.glyphicons').popover({
            trigger: 'hover',
            placement: 'right'
        });
    }

    $(document).click(function (e) {
        if (isVisible & clickedAway) {
            $('a[rel=popover]').popover('hide').removeClass('active')
            isVisible = clickedAway = false
        } else {
            clickedAway = true
        }
    });

    $('#selectedDate').change(function () {
        var value = $('#selectedDate').val();
        if (value !== prettyDate) {
            $('#appointmentTimepicker').timepicker('option', 'minTime', '8:00AM');
        }
        else {
            $('#appointmentTimepicker').timepicker('option', 'minTime', minTime());
        }
    });
});

$(window).resize(function () {
    'use strict';
    var windowHeight = $(window).height();
    $('.slide-deck-column').height(windowHeight);
});

function minTime() {
    var currentDate = +new Date().getDate(),
        currentHour = +new Date().getHours(),
        currentMinute = +new Date().getMinutes();
    if (currentHour < 8 || currentHour > 21) {
        return "8:00AM";
    }
    else {
        if (currentHour < 12) {
            if (currentMinute < 30) {
                return currentHour + ":30AM";
            }
            else {
                return (currentHour + 1) < 12 ? (currentHour + 1) + ":00AM" : (currentHour + 1) + ":00PM";
            }
        }
        else {
            if (currentMinute < 30) {
                return (currentHour - 12) + ":30PM";
            }
            else {
                return (currentHour - 12 + 1) + ":00PM";
            }
        }
    }
}

function hideSidebar() {
    $('body').removeClass('sidebar-active');
    $('#sidebar').animate({
        marginLeft: '-280px'
    }, 'fast');
    $('#main-container').animate({
        marginLeft: '0px'
    }, 'fast');
    $('.hide-deck').hide();
    $('.show-deck').show();
}
function showSidebar() {
    $('body').addClass('sidebar-active');
    $('#sidebar').animate({
        marginLeft: '0px'
    }, 'fast');
    $('#main-container').animate({
        marginLeft: '280px'
    }, 'fast');
    $('.show-deck').hide();
    $('.hide-deck').show();
}
/*
* Google Charts
*/
// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart() {
    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Program');
    data.addColumn('number', 'Deals Funded');
    data.addRows([
['Drive', 15],
['SAF', 12],
['RoadLoans', 3],
]);
    // Set chart options
    var options = { 'title': 'Deals Funding by Program' };
    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('deals-funded'));
    chart.draw(data, options);
}
function drawChart2() {
    // Create and populate the data table.
    var data = google.visualization.arrayToDataTable([
['Last 3 Months', 'Drive', 'SAF', 'RoadLoans'],
['June', 22, 5, 10],
['July', 17, 6, 4],
['August', 18, 52, 3]
]);
    // Create and draw the visualization.
    new google.visualization.ColumnChart(document.getElementById('sguard-deals')).
draw(data, {
    title: "Deals Funded with Sguard",
    hAxis: { title: "Last 3 Months" }
});
}
function drawVisualization() {
    drawChart();
    drawChart2();
}