(function (parent, $, _, moment) {

    //#region Variables

    if (typeof ($) === undefined || typeof (_) === undefined || typeof (moment) === undefined) {
        throw 'jQuery, Underscore and Moment plugins are required, please ensure it is loaded before loading this javascript';
    }

    var utils = parent.utilities = parent.utilities || {};

    //#region Private methods

    function readCookie(name) {
        var foundCookieIndex,
            individualCookie,
            expectedCookie = name + "=",
            browserCookies = document.cookie.split(';');

        for (var i = 0; i < browserCookies.length; i++) {
            individualCookie = browserCookies[i];
            while (individualCookie.charAt(0) == ' ') individualCookie = individualCookie.substring(1, individualCookie.length);
            foundCookieIndex = individualCookie.indexOf(expectedCookie);
            if (foundCookieIndex == 0) {
                return individualCookie.substring(expectedCookie.length, individualCookie.length);
            }
        }
        return false;
    };

    function createCookie(name, value, timevalue, timetype) {
        var timePeriod, expires, date = new Date();
        if (timetype == "d") {
            timePeriod = timevalue * 24 * 60 * 60 * 1000;
            date.setTime(date.getTime() + timePeriod);
            expires = "; expires=" + date.toGMTString();
        }
        else {
            if (timetype == "h") {
                timePeriod = timevalue * 60 * 60 * 1000;
                date.setTime(date.getTime() + timePeriod);
                expires = "; expires=" + date.toGMTString();
            }
            else {
                if (timetype == "m") {
                    timePeriod = timevalue * 60 * 1000;
                    date.setTime(date.getTime() + timePeriod);
                    expires = "; expires=" + date.toGMTString();
                }
                else {
                    if (timetype == "e") {
                        timePeriod = -1;
                        date.setTime(date.getTime() + timePeriod);
                        expires = "; expires=" + date.toGMTString();
                    }
                    else {
                        expires = "";
                    }
                }
            }
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    };

    function eraseCookie(name) {
        if (readCookie(name)) {
            return createCookie(name, "", -1, "e");
        }
    };

    function getCompanyName(attr) {
        var name = attr.siteCompanyMapping[readCookie("FinanceCompanyId")];
        return _.isUndefined(name) ? "default" : name;
    }

    function priceFormat(value, digits, sign) {
        var inputValue, pricePart1, pricePart2, regexForThousandPlace, regexForSignAndDecimal, outputValue, signIndex, numberArray, signDecision;
        regexForThousandPlace = /(\d+)(\d{3})/;
        signDecision = (sign == "negative") ? -1 : 1;
        inputValue = numberRound(signDecision * value, digits);
        inputValue += '';
        regexForSignAndDecimal = /[.,\/-]/;
        numberArray = XRegExp.split(inputValue, regexForSignAndDecimal);
        signIndex = inputValue < 0 ? 1 : 0;
        pricePart1 = numberArray[signIndex];
        pricePart2 = numberArray.length > 1 ? '.' + numberArray[signIndex + 1] : '';
        while (regexForThousandPlace.test(pricePart1)) {
            pricePart1 = pricePart1.replace(regexForThousandPlace, '$1' + ',' + '$2');
        }
        outputValue = pricePart1 + pricePart2;
        return (inputValue < 0 ? "($" + outputValue + ")" : "$" + outputValue);  
    }

    function percentFormat(value, digits) {
        if (utils.checkEmptyNullServerResponse(value)) {
            var inputValue = numberRound(value, digits);
            return inputValue + "%";
        }
        else {
            return "";
        }
    }

    function phoneFormat(value) {
        if (utils.checkEmptyNullServerResponse(value)) {
            var inputValue = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            return inputValue;
        }
        else {
            return "";
        }
    }

    function numberRound(value, digits) {
        return (Math.round((value * Math.pow(10, digits)).toFixed(digits - 1)) / Math.pow(10, digits)).toFixed(digits);
    }

    function dateFormat(date, format) {
        if (date === "0001-01-01T00:00:00" || date === "") {
            return date = "NA";
        } else {
            if (format === "dateOnly") {
                return moment(date).format("MM/DD/YYYY");
            }
            else {
                if (format === "time") {
                    return moment(date).format("hh:mm A");
                }
                else {
                    if (format === "dateTime") {
                        return moment(date).format("MM-DD-YYYY, hh:mm A");
                    }
                }
            }
        }
    }

    function formatHandler(value, options) {
        if (options) {
            if (options.format === "price") {
                return priceFormat(value, 2, options.sign);
            }
            else if (options.format === "percent") {
                return percentFormat(value, 2);
            }
            else if (options.format === "phone") {
                return phoneFormat(value);
            }
            else if (options.format === "dateOnly" || options.format === "time" || options.format === "dateTime") {
                return dateFormat(value, options.format);
            }
            else if (options.format === "number") {
                return numberRound(value, options.digits);
            }
            else {
                return value;
            }
        }
        else {
            return value;
        }
    }

    //#region Constructors

    utils.TimeTracker = function TimeTracker(options) {
        var timer,
            self = this,
            enable = options.enable,
            seconds = options.seconds || 600,
            warnTrigger = options.warnTrigger || 120,
            updateStatus = options.onUpdateStatus || function () { },
            warnAction = options.onWarnAction || function () { },
            counterEnd = options.onCounterEnd || function () { },
            decrementCounter = function () {
                if (seconds < warnTrigger) {
                    warnAction(seconds);
                }
                if (seconds === 0) {
                    counterEnd();
                    self.stop();
                }
                else {
                    updateStatus(seconds);
                }
                seconds--;
            };

        self.start = function () {
            clearInterval(timer);
            timer = 0;
            seconds = options.seconds;
            if (enable) {
                timer = setInterval(decrementCounter, 1000);
            }
        };

        self.stop = function () {
            clearInterval(timer);
        };
    };

    //#region Public methods

    utils.readCookie = function (name) {
        return readCookie(name);
    };

    utils.createCookie = function (name, value, timevalue, timetype) {
        return createCookie(name, value, timevalue, timetype);
    };

    utils.checkEmptyNullServerResponse = function (data) {
        var isEmtyNullUndefined = _.isEmpty(data) || _.isNull(data) || _.isUndefined(data);
        return isEmtyNullUndefined === false;
    };

    utils.checkLoggedIn = function () {
        var location = window.location.pathname;
        if (location !== "/home" && location !== "/" && location !== "/LoginAssistance") {
            if (readCookie("AuthHeader")) {
                $("#main").show();
            }
            else {
                if ((readCookie("TargetPage")) || (location === "/SSOOops.htm")) {
                    $("#main").show();
                    $("#serverErrorData").hide();
                }
                else {
                    $("#main").hide();
                    DE.proxy.defaultFailureHandler("401");
                }
            }
        }
        else {
            $("#main").show();
        }
    };

    utils.formatHandler = function (value, options) {
        return formatHandler(value, options);
    };

    utils.logoutHandler = function () {
        eraseCookie("AuthHeader");
        eraseCookie("DealerID");
        eraseCookie("WebRoleID");
        eraseCookie("UserID");
        eraseCookie("IsSuper");
        eraseCookie("UserName");
        eraseCookie("IsPasswordChangeRequired");
        if (readCookie("TargetPage")) {
            eraseCookie("TargetPage");
            eraseCookie("CreditPartnerCodeID");
            eraseCookie("CreditPartnerID");
            eraseCookie("FinanceCompanyId");
            eraseCookie(".SPDEALERPORTAL");
            window.location.href = "/cc-logged-out.htm";
            //window.open('', '_self', '');
            //window.close();
        }
        else {
            window.location.href = "/home";
        }
        //window.location.href = "/cc";
    };

    utils.vehicleAgeChecker = function (condition, conditionIdForNew, year) {
        return (condition !== conditionIdForNew &&
                    (year <= parseFloat(moment().format('YYYY')) && year > parseFloat(moment().format('YYYY')) - 10)) ||
                (condition === conditionIdForNew &&
                    (year >= (parseFloat(moment().format('YYYY')) - 1) && year < (parseFloat(moment().format('YYYY')) + 2)));
    };

    utils.configureSite = (function () {
        var actions = {
            applyVisibilityChanges: function (attr, pageName) {
                var localData = attr.Invisible[getCompanyName(attr)] || "";
                $.each(localData, function (key, val) {
                    if (key === "Global" || key === pageName) {
                        $.each(val, function (i, v) {
                            $(v).hide();
                        });
                    }
                });
            },
            applyContentChanges: function (attr) {
                var localData = attr.Content.selector || "";
                $.each(localData, function (key, value) {
                    if (key === getCompanyName(attr)) {
                        $(value).show();
                    }
                    else {
                        $(value).hide();
                    }
                });
            },
            applyLinkChanges: function (attr) {
                var localData = attr.Links || "";
                $.each(localData, function (key, value) {
                    var sel = value.selector,
                        url = value.href[getCompanyName(attr)],
                        txt = value.text ? value.text[getCompanyName(attr)] : undefined;
                    if (url && $(sel)) {
                        $(sel).attr('href', url);
                        if (txt) {
                            $(sel).text(txt);
                        }
                        return;
                    }
                });
            },
            applyImageChanges: function (attr) {
                var localData = attr.Images || "";
                $.each(localData, function (key, value) {
                    var sel = value.selector,
                        url = value.src[getCompanyName(attr)];
                    if (url && $(sel)) {
                        $(sel).attr('src', url);
                        return;
                    }
                });
            }
        };

        return actions;
    } ());

} (DE, jQuery, _, moment));