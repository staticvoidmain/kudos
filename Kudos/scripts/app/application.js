/// <reference path="../app/appUIControls.js" />
/// <reference path="../lib/jquery-1.9.1-vsdoc.js" />
/// <reference path="../lib/knockout-2.2.1.js" />
/// <reference path="../lib/underscore.js" />
/// <reference path="../app/de_utilities.js" />
/// <reference path="../app/de_lookups.js" />
/// <reference path="../app/de_proxy.js" />

_.templateSettings = {
    escape: /\{\{-([\s\S]+?)\}\}/g,
    evaluate: /\{\{([\s\S]+?)\}\}/g,
    interpolate: /\{\{=([\s\S]+?)\}\}/g
};

var isModalShown = false,
    trackSession = new DE.utilities.TimeTracker({
        enable: true,
        seconds: 600,
        warnTrigger: 120,
        onUpdateStatus: function (sec) {
            if (isModalShown === true) {
                $("#timeout-modal").on("hidden", function () {
                    isModalShown = false;
                    trackSession.start();
                });
            }
        },
        onWarnAction: function (sec) {
            if (isModalShown === false) {
                $("#timeout-modal").on('focusin', function (e) {
                    e.stopPropagation();
                });
                $("#timeout-modal").modal("show");
	            isModalShown = true;
            }
            $("#timeLeft").html(sec);
        },
        onCounterEnd: function () {
            DE.utilities.logoutHandler();
        }
    });

if (!($("#homePage").length)) {
    trackSession.start();
}

var applySiteSettings = function (options) {
    DE.utilities.configureSite.applyVisibilityChanges(options, $('#page-header .page-title').text());
    DE.utilities.configureSite.applyContentChanges(options);
    DE.utilities.configureSite.applyLinkChanges(options);
    DE.utilities.configureSite.applyImageChanges(options);
};

/* Login */

var LoginViewModel = function () {
    var self = this, temp = '';

    self.userName = ko.observable().extend({ required: true });
    self.password = ko.observable().extend({ required: true });

    self.feedback = {
        text: ko.observable(),
        isVisible: ko.observable(false),
        feedbackClass: ko.observable()
    };
    self.errors = ko.validation.group(self);

    self.setHeader = function (xhr) {
        var token = self.userName() + ":" + self.password();
        xhr.setRequestHeader('Authorization', 'Basic ' + token);
    };
	self.onSuccess = function (response) {
        if (response.WebRoleId === 6) {
            DE.utilities.createCookie("UserName", self.userName());
        }
        DE.utilities.createCookie("IsPasswordChangeRequired", response.IsPasswordChangeRequired, 10, "m");
        //DE.utilities.createCookie("FinanceCompanyId", 8);
        window.location.href = "/My/legalAcknowledgement";
    };
	self.onFailure = function (jqXHR, textStatus, errorThrown) {
        var statusCode = jqXHR.status;
        self.feedback.isVisible(true);
        self.feedback.feedbackClass("text-error");
        self.feedback.text(DE.lookups.errorMessage[statusCode].errorText);
    };
	self.login = function () {
        if (_.isEmpty(self.errors())) {
            DE.proxy.login(self.onSuccess, self.onFailure, self.setHeader);
        }
        else {
            self.errors.showAllMessages();
        }
    };
};
/*Recover Username and Reset Password */

var ResetPasswordUsernameViewModel = function () {
    var self = this;

    self.emailId = ko.observable().extend({ required: true, email: true });
    self.userName = ko.observable();
    self.question = ko.observable();
    self.answer = ko.observable().extend({ required: true });
    self.isEmailError = ko.observable(false);
    self.isQuestionError = ko.observable(false);
    self.isAnswerError = ko.observable(false);
    self.isResetError = ko.observable(false);
    self.isResetSuccess = ko.observable(false);
    self.isUserNameVisible = ko.observable(false);
    self.isSubmitVisible = ko.observable(false);
    self.isResetPasswordVisible = ko.observable(true);
    self.isRecoverUserNameVisible = ko.observable(true);
    self.isSecurityQuestionVisible = ko.observable(false);

    self.errors = ko.validation.group(self);

    var userObject,
        onEmailSuccess = function (data) {
            if (DE.utilities.checkEmptyNullServerResponse(data)) {
                userObject = data;
                self.userName(userObject.UserName);
                self.isEmailError(false);
            }
            else {
                self.isEmailError(true);
            }
        },
        onAnswerSuccess = function (data) {
            if (data) {
                self.isAnswerError(false);
            }
            else {
                self.isAnswerError(true);
            }
        };

    self.onEmailBlur = function () {
        var email = self.emailId();

        if (DE.utilities.checkEmptyNullServerResponse(email) && _.isNull(self.emailId.error)) {
            DE.proxy.getUserByEmail(email, onEmailSuccess);
        }
        else {
            self.emailId.isModified(true);
        }
    };
	self.onAnswerBlur = function () {
        var email = self.emailId(),
            answer = self.answer();

        if (DE.utilities.checkEmptyNullServerResponse(answer) && _.isNull(self.answer.error)) {
            DE.proxy.getValidateAnswer(email, answer, onAnswerSuccess);
        }
        else {
            self.answer.isModified(true);
        }
    };
	self.resetPassword = function () {
        var email = self.emailId(),
            onQuestionSuccess = function (response, textStatus, jqXHR) {
                if (jqXHR.status === 200 && response !== "") {
                    self.isSubmitVisible(true);
                    self.isResetPasswordVisible(false);
                    self.isQuestionError(false);
                    self.question(response);
                }
                else {
                    self.isQuestionError(true);
                    self.question("Security Question not available");
                    $("#answer").hide();
                }
            };

        if (_.isEmpty(email) === false && email && self.userName() !== "") {
            self.isSecurityQuestionVisible(true);
            self.isRecoverUserNameVisible(false);
            self.isUserNameVisible(false);
            DE.proxy.getQuestion(email, onQuestionSuccess);
        }
        else {
            if (_.isEmpty(email)) self.emailId.isModified(true);
        }
    };
	self.submitPassword = function () {
        var userName = self.userName(),
            email = self.emailId(),
            onResetSuccess = function (response, textStatus, jqXHR) {
                if (jqXHR.status === 200) {
                    self.isResetError(false);
                    self.isSecurityQuestionVisible(false);
                    self.isRecoverUserNameVisible(false);
                    self.isUserNameVisible(false);
                    self.isSubmitVisible(false);
                    self.isResetPasswordVisible(false);
                    self.isQuestionError(false);
                    self.isResetSuccess(true);
                }
                else {
                    self.isResetError(true);
                    self.isResetSuccess(false);
                }
            };
        if (_.isEmpty(self.errors()) && self.userName() !== "" && self.isAnswerError() === false) {
            self.isRecoverUserNameVisible(false);
            self.isUserNameVisible(false);
            DE.proxy.postResetPassword(userName, email, onResetSuccess);
        }
        else {
            self.errors.showAllMessages();
        }
    };
	self.recoverUsername = function () {
        var email = self.emailId();
        if (_.isEmpty(email) === false && email && self.userName() !== "") {
            self.isUserNameVisible(true);
        }
        else {
            if (_.isEmpty(email)) self.emailId.isModified(true);
        }
    };
};
var ChangePasswordViewModel = function () {
    var self = this,
        questionList = [
            "What was the name of the first school you attended?",
            "What is the name of the city you were born in?",
            "What is your mother's maiden name?",
            "Who was your first employer?",
            "Who is your favorite athlete?",
            "What is your favorite movie?",
            "What is the name of your first pet?"
        ],
        flag = DE.utilities.readCookie("IsPasswordChangeRequired") === "true",
        questionSetSuccessFlag = false,
        onQuestionAnswerSuccess = function (response) {
            DE.proxy.postChangePassword(self.userId(), self.password(), onChangePasswordSuccess);
        },
        onChangePasswordSuccess = function (response, textStatus, jqXHR) {
            $("#modal-submit-success").modal("show");
        };

    self.userId = ko.observable(DE.utilities.readCookie("UserID"));
    self.isSecurityQuestionSectionVisible = ko.observable(flag);
    self.securityQuestions = ko.observableArray([]);
    self.selectedQuestion = ko.observable().extend({
        conditional_required: function () { return self.isSecurityQuestionSectionVisible(); }
    });
    self.answer = ko.observable().extend({
        conditional_required: function () { return self.isSecurityQuestionSectionVisible(); },
        minLength: 3,
        pattern: {
            message: 'Only alphanumeric or special characters (@ # * , . - _) allowed',
            params: /^[\w\s\@*#\-_\(\),\.]+/
        }
    });
    self.confirmAnswer = ko.observable().extend({ equal: self.answer });
    self.password = ko.observable().extend({
        required: true,
        minLength: 8,
        pattern: {
            message: "Atleast one capitalized letter required",
            params: /^(?=[A-Z]+)\S{8,}$/
        }
    });
    self.confirmPassword = ko.observable().extend({ equal: self.password });

    $.each(questionList, function (i, val) {
        self.securityQuestions.push({ id: val, text: val });
    });

    self.postPasswordChangeLogout = function (data, event) {
        event.preventDefault();
        DE.utilities.logoutHandler();
    };

    self.onCancel = function () {
        if (flag) {
            DE.utilities.logoutHandler();
        }
        else {
            window.location.href = "/my/Dashboard";
        }
    };
	self.onNewPasswordSubmit = function () {
        self.errors = ko.validation.group(self);
        if (_.isEmpty(self.errors())) {
            if (flag) {
                DE.proxy.postQuestionAnswer(self.userId(), self.selectedQuestion(), self.answer(), onQuestionAnswerSuccess);
            }
            else {
                DE.proxy.postChangePassword(self.userId(), self.password(), onChangePasswordSuccess);
            }
        }
        else {
            self.errors.showAllMessages();
        }
    };
};
/* Roles and Permissions */

var rolesProvider = (function () {
    var webRoleId = DE.utilities.readCookie("WebRoleID"),
        container = {},
        homePage,
        onSuccess = function (response) {
            container.permissions = response.WebRolePermissions;
            container.homePage = response.Homepage;
        };

    if (webRoleId !== false) {
        DE.proxy.getRoles(webRoleId, onSuccess);
    }

    return {
        hasPermission: function (permissionName) {
            return container.permissions[permissionName];
        },
        homePage: container.homePage
    };
} ());

var HeaderPrimaryViewModel = function () {
    var self = this,
        permission = function (propertyName) {
            self[propertyName] = ko.observable(rolesProvider.hasPermission(propertyName));
        };

    self.isVisibleForChrysler = ko.observable(DE.utilities.readCookie("FinanceCompanyId") === "8");
    self.chryslerRedirect = ko.observable();

    permission("CanViewAppsInFundingPage");
    permission("CanViewApplicationsPage");
    permission("CanViewLeadsPage");
    permission("CanViewInventoryUploadPage");
    permission("CanViewAppSubmitPage");
    permission("CanViewLaunchChrysler");

    self.onSuccess = function (response) {
        window.open(response, '', "resizable,toolbar=yes,location=yes,scrollbars=yes,menubar=yes");
    };
	self.redirectToChrysler = function () {
        if (DE.utilities.readCookie("UserName") && self.isVisibleForChrysler() === false) {
            DE.proxy.getChryslerRedirect(self.onSuccess);
        }
    };
};
var HeaderSecondaryViewModel = function () {
    var self = this,
        permission = function (propertyName) {
            self[propertyName] = ko.observable(rolesProvider.hasPermission(propertyName));
        };

    permission("CanViewUserManagementPage");
    permission("CanViewMyDashboardPage");
    permission("CanViewDealerDocsPage");
    permission("CanViewOldExtranetSite");

    self.logout = function () {
        DE.utilities.logoutHandler();
    };
};
var LogoSectionViewModel = function () {
    var self = this;
    self.homepage = ko.observable("/my/" + rolesProvider.homePage);
};
var FooterViewModel = function () {
    var self = this,
        permission = function (propertyName) {
            self[propertyName] = ko.observable(rolesProvider.hasPermission(propertyName));
        };

    permission("CanViewMyDashboardPage");
    permission("CanViewDealerDocsPage");
};
var FundingsRedirectViewModel = function () {
    var self = this,
        permission = function (propertyName) {
            self[propertyName] = ko.observable(rolesProvider.hasPermission(propertyName));
        };

    permission("CanViewAppsInFundingPage");
};
var VendorAssignmentViewModel = function (attr) {
    var self = this,
        webRoleId = DE.utilities.readCookie("WebRoleID"),
        isChrysler = function () {
            return DE.utilities.readCookie("FinanceCompanyId") === "8";
        },
        numberofdays = attr ? attr.numberOfDays : "30";

    self.isAdmin = ko.computed(function () { return webRoleId === "6"; });
    self.vendorId = ko.observable(DE.utilities.readCookie("DealerID"));
    self.userId = ko.observable(DE.utilities.readCookie("UserID"));
    self.vendorName = ko.observable();
    self.vendorList = ko.observableArray([]);
    self.selectedVendor = ko.observable();
    self.isCustomVendorVisible = ko.observable(false);
    self.isVendorSelectionVisible = ko.observable(false);

    self.checkAdmin = function () {
        return self.isCustomVendorVisible(self.isAdmin());
    };
	self.onVendorNameSuccess = function (response) {
        self.vendorName(response);
    };
	self.onVendorIdListSuccess = function (response) {
        if (DE.utilities.checkEmptyNullServerResponse(response) && isChrysler() === false) {
            if (response.length > 1) {
                $.each(response, function (i, val) {
                    self.vendorList.push({ id: val.Id, text: val.Description });
                });

                self.isVendorSelectionVisible(true);
                self.selectedVendor(self.vendorId());
                self.selectedVendor.subscribe(function (value) {
                    self.vendorId(value);
                    DE.utilities.createCookie("DealerID", value);
                    self.resetHandler();
                } .bind(self));
                $("#vendorSelection").css({ "margin": "3px 10px 0 10px" });
            }
            self.vendorName(response[0].Description);
        }
        else {
            if (DE.utilities.checkEmptyNullServerResponse(self.vendorId())) {
                DE.proxy.getVendorName(self.vendorId(), self.onVendorNameSuccess);
            }
        }
    };
	self.refresh = function () {
        var latestId = self.vendorId();
        DE.utilities.createCookie("DealerID", latestId);
        DE.proxy.getVendorName(latestId, self.onVendorNameSuccess);
        self.resetHandler();
    };
	self.resetHandler = function () {
        if ($("#vendorDetails").length) {
            ko.applyBindings(self, document.getElementById("vendorDetails"));
        }
        if ($("#performanceDashboard").length) {
            __dashboardData.loadDashboardData(self.vendorId(), DE.utilities.readCookie("FinanceCompanyId"), __dashboardData.onDashboardDataSuccess);
        }
        if (attr) {
            __slideDeckItems.slideDeckItems.removeAll();
            DE.proxy.getSlideDeckItems_normal(attr.module, self.vendorId(), numberofdays, __slideDeckItems.onSuccess);
        }
        if ($("#userManagement").length) {
            window.location.href = "/my/usermanagement";
        }
        if ($("#sGuardLinks").length) {
            __sGuard.vendorId(self.vendorId());
        }
        if ($("#legalAcknowledgementSection").length) {
            window.location.href = "submitapp";
        }
    };
	self.checkAdmin();
    DE.proxy.getVendorIdList(self.userId(), self.onVendorIdListSuccess);
    if ($("#vendorDetails").length) {
        ko.applyBindings(self, document.getElementById("vendorDetails"));
    }
};
/* Legal Acknowledgement */
var AcknowledgementViewModel = function () {
    var self = this,
        vendorId = DE.utilities.readCookie("DealerID"),
        webRoleId = DE.utilities.readCookie("WebRoleID");
    targetPageSSO = DE.utilities.readCookie("TargetPage");

    self.accept = function () {
        var message = { "VendorId": vendorId, "WebRoleId": webRoleId };
        DE.proxy.postAcknowledgement(ko.toJSON(message), self.onSuccess);
    };

    self.decline = function (data, event) {
        event.preventDefault();
        DE.utilities.logoutHandler();
    };

    self.onSuccess = function (response) {
        var flag = DE.utilities.readCookie("IsPasswordChangeRequired");
        if (flag === "true") {
            window.location.href = "/My/settings";
        }
        else {
            if (vendorId === 0) {
                if (targetPageSSO) {
                    window.location.href = targetPageSSO;
                }
                else {
                    window.location.href = "/Dashboard";
                }
            }
            else {
                if (targetPageSSO) {
                    window.location.href = targetPageSSO;
                }
                else if (webRoleId == "41" || webRoleId == "42") { /* 41 is Hyundai */
                    window.location.href = "/Applications";
                }
                else {
                    window.location.href = response;
                }
            }
        }
    };
};
/*S-Guard Link on Dashboard */

var SguardViewModel = function () {
    var self = this;

    self.vendorId = ko.observable(DE.utilities.readCookie("DealerID"));
    self.sGuardLink = ko.computed(function () {
        return "http://sguard.efgcompanies.com/RatingEngine.aspx?VID=" + self.vendorId();
    });
};

/* Slide Deck*/

var SlideDeckItem = function (data, onItemClick, module, vendorId) {
    var self = this;
    self.isPrequal = ko.observable(false);

    self.description = ko.observable(data.Description);

    $.each(data.SlideItems, function () {
        if (this.Value === "0") {
            this.Value = "";
        }
        if (this.Title === "number") {
            this.Value = DE.utilities.formatHandler(this.Value, { format: "phone" });
        }
        self[this.Title] = ko.observable(this.Value);
    });

    self.statusClass = ko.computed(function () {
        var preQualFlag = _.has(self, 'isPrequalificationApp') ? self.isPrequalificationApp() : false;
        if (preQualFlag === "True") {
            return DE.lookups.styleMap.slideDeck["Webleads"].style;
        }
        else {
            return DE.lookups.styleMap.slideDeck[self.status()].style;
        }
    });

    self.iconStatusClass = ko.computed(function () {
        var preQualFlag = _.has(self, 'isPrequalificationApp') ? self.isPrequalificationApp() : false;
        if (preQualFlag === "True") {
            self.isPrequal(true);
            return DE.lookups.styleMap.slideDeck["Webleads"].iconStyle;
        }
        else {
            return DE.lookups.styleMap.slideDeck[self.status()].iconStyle;
        }
    });

    self.leadIndicator = _.isUndefined(self.leadqualityIndicator) === false;
    self.flag = ko.observable(false);

    self.onSlideDeckItemClick = function () {
        if ($("#show-last-approval").length) {
            $("#show-last-approval").html('<i class="icon-file"></i> Show Last Approval');
            $('#lastApproval').hide();
            $('#funding-summary').show();
        }
        if ($("#show-purchase-letter").length) {
            $("#show-purchase-letter").html('<i class="icon-file"></i> Show Purchase Letter');
            $('#purchase').hide();
            $('#funding-summary').show();
        }
        onItemClick(self, module, vendorId);
    };
};

var SlideDeckViewModel = function (onItemClick, attr) {
    var self = this,
        webRoleId = DE.utilities.readCookie("WebRoleID"),
        paging = attr.paging,
        module = attr.module,
        setSize = attr.setSize,
        numberofdays = attr.numberOfDays || "30";

    self.queueSlideDeckItems = ko.observableArray([]);
    self.slideDeckItems = ko.observableArray([]);
    self.itemCount = ko.observable();
    self.totalCount = ko.observable();
    self.isLoadMoreEnabled = ko.observable(true);
    self.vendorId = ko.observable(DE.utilities.readCookie("DealerID"));
    self.externalAppId = ko.observable("");
    self.isExternalAppIdSearchEnabled = ko.computed(function () {
        var isVisible = false;
        if (webRoleId == "41" || webRoleId == "42") {
            isVisible = true;
        }
        return isVisible;
    });

    self.refresh = function () {
        self.slideDeckItems.removeAll();
        DE.proxy.getSlideDeckItems_normal(module, DE.utilities.readCookie("DealerID"), numberofdays, self.onSuccess);
        return false;
    };
	self.getExternalApplicationId = function () {
        self.slideDeckItems.removeAll();
        DE.proxy.getSlideDeckItems_hyundai(module, webRoleId, self.externalAppId(), self.onSuccess);
        return false;
    };
	self.activateChild = function (child) {
        $.each(self.slideDeckItems(), function () {
            if (this === child) {
                this.flag(true);
                this.onSlideDeckItemClick();
            } else { this.flag(false); }
        });
    };
	self.onSuccess = function (response) {
        if (DE.utilities.checkEmptyNullServerResponse(response)) {
            self.queueNewSlideDeckItem(response);
            $("#serverSuccessData").show();
            $("#serverErrorData").hide();
        }
        else {
            $("#serverSuccessData").hide();
            self.itemCount("0");
            self.totalCount("0");
            $("#serverErrorData").show().css({ 'text-align': 'center', 'margin': '60px 0', 'font-weight': 'bold' });
            if (self.isExternalAppIdSearchEnabled() == true) {
                var latestId = self.externalAppId();
                if (latestId != "") {
                    $('#SearchNoDataFoundMessage').modal('show');
                }
            }
        }
    };
	self.queueNewSlideDeckItem = function (data) {
        self.queueSlideDeckItems([]);
        $.each(data, function () {
            self.queueSlideDeckItems.push(this);
        });
        self.totalCount(data.length);
        self.addNewSlideDeckItem(self.queueSlideDeckItems());
    };
	self.addNewSlideDeckItem = function (data) {
        var dataArray = data === self ? self.queueSlideDeckItems() : data,
            dataLength = dataArray.length,
            currLength = self.slideDeckItems().length,
            itemSetSize = paging ? setSize : dataLength,
            count = Math.min(dataLength - currLength, itemSetSize),
            startIndex = currLength,
            endIndex = startIndex + count,
            isLastLoad = (dataLength - currLength) <= itemSetSize,
            itemIndex = startIndex;
        if (currLength !== dataLength) {
            for (startIndex; startIndex < endIndex; startIndex++) {
                self.slideDeckItems.push(new SlideDeckItem(dataArray[startIndex], onItemClick, module, DE.utilities.readCookie("DealerID")));
            }
            self.itemCount(endIndex);
        }
        self.isLoadMoreEnabled(isLastLoad === false);
        self.activateChild(self.slideDeckItems()[itemIndex]);
        $('#filter-apps').fastLiveFilter('.deck-items', {
            callback: function (total) { self.itemCount(total); }
        });
    };
	if (self.isExternalAppIdSearchEnabled() == true) {
        DE.proxy.getSlideDeckItems_hyundai(module, webRoleId, self.externalAppId(), self.onSuccess);
    }
    else {
        DE.proxy.getSlideDeckItems_normal(module, DE.utilities.readCookie("DealerID"), numberofdays, self.onSuccess);
    }
};

var AdvanceSearchViewModel = function (attr) {
    var self = this, d = new Date(), module = attr.module;
    self.searchCriteria = ko.observable();
    self.startDate = ko.observable();
    self.endDate = ko.observable();
    self.criteria = ko.computed(function () {
        return _.isUndefined(self.searchCriteria()) ? "" : self.searchCriteria();
    });

    self.advancedSearch = function () {
        __slideDeckItems.slideDeckItems.removeAll();
        DE.proxy.getAdvancedSearch(module, DE.utilities.readCookie("DealerID"), self.criteria(), self.startDate(), self.endDate(), __slideDeckItems.onSuccess);
        $('#search-modal').modal('hide');
        return false;
    };
	self.resetForm = function () {
        self.searchCriteria("");
        self.startDate("");
        self.endDate("");
    };
	self.cancel = function () {
        self.resetForm();
        $('#search-modal').modal('hide');
    };
	$('#search-modal').on('hidden', function () {
        self.cancel();
    });
};

/* Generic Object Handler */

var ObservableObjectViewModel = function () {
    var self = this;

    self.populateRecursive = function (target, data) {
        $.each(data, function (key, value) {
            if ($.isPlainObject(value) == false && $.isArray(value) == false) {
                target[key] = {
                    itemValue: ko.observable(self.conditionalFormatting(key, value)),
                    isVisible: ko.observable(self.checkVisibility(key, value))
                };
            }
            else {
                var newObjectProperty = {};
                target[key] = newObjectProperty;
                self.populateRecursive(newObjectProperty, value);
            }
        });
    };

    self.populateRehashRecursive = function (attr) {
        var target = attr.target,
            data = attr.data,
            blankCopy = _.isUndefined(attr.blankCopy) ? false : attr.blankCopy;
        $.each(data, function (key, value) {
            if ($.isPlainObject(value) == false && $.isArray(value) == false) {
                if (blankCopy) {
                    target[key] = ko.observable();
                }
                else {
                    target[key] = ko.observable(value);
                }
            }
            else {
                var newObjectProperty = {};
                target[key] = newObjectProperty;
                self.populateRehashRecursive({ target: newObjectProperty, data: value, blankCopy: blankCopy });
            }
        });
    };

    self.copyNewObjectValueToOldObservableObject = function (target, data) {
        $.each(data, function (key, value) {
            if (target[key]) {
                if ($.isPlainObject(value) === false && $.isArray(value) === false) {
                    target[key](value);
                } else {
                    self.copyNewObjectValueToOldObservableObject(target[key], value);
                }
            }
        });
    };
	self.flattenObjectToKeyValue = function (target, data, valueField, pKey) {
        var tempKey = pKey;
        $.each(data, function (key, value) {
            if ($.isPlainObject(value) === false) {
                if (key === valueField) {
                    if ($.isArray(value) === false) {
                        target[tempKey] = ko.observable(value);
                    }
                    else {
                        $.each(value, function (i, val) {
                            target[tempKey + (i + 1)] = ko.observable(val);
                        });
                    }
                }
            } else {
                pKey = key;
                self.flattenObjectToKeyValue(target, value, valueField, pKey);
            }
        });
    };

    self.checkVisibility = function (key, value) {
        return !(value === "" && key === "AddressLine2");
    };
	self.populateDynamic = function (target, data) {
        if (DE.utilities.checkEmptyNullServerResponse(target)) {
            $.each(data, function (key, value) {
                if ($.isPlainObject(value) == false && $.isArray(value) == false) {
                    if (!target[key]) {
                        if (key === "VendorId") {
                            target[key] = {
                                itemValue: ko.observable($("#vendorId").val()),
                                isVisible: ko.observable(true)
                            };
                        }
                        else {
                            target[key] = {
                                itemValue: ko.observable(value),
                                isVisible: ko.observable(false)
                            };
                        }
                    }
                    else if (target[key].itemValue() === "" || target[key].itemValue() === "0" || target[key].itemValue() === "0.00" || target[key].itemValue() === "-") {
                        target[key].isVisible(false);
                    }
                } else {
                    self.populateDynamic(target[key], value);
                }
            });
        }
    };

    self.toObservableArray = function (data) {
        var result = ko.observableArray([]);
        data = _.isUndefined(data) ? [{ "itemValue": ko.observable("-")}] : data;
        $.each(data, function () {
            result.push(this);
        });
        return result;
    };

    self.conditionalFormatting = function (key, value) {
        var attribute = self.dataAttributes[key];
        if (value === "0" || value === "" || value === "0.0" || value === "0.00") {
            if (key !== "CoApplicant" && key !== "Participation" && key !== "ContractFee") {
                return "-";
            }
        }
        if (value === "Not Defined") {
            if (key === "Program") {
                return "-";
            }
        }

        if (attribute) {
            value = DE.utilities.formatHandler(value, attribute);
        }
        return value;
    };
};

/* Funding Details */

var CommentsCtor = function (data) {
    var self = this;
    if (data) {
        self.comment = ko.observable(data.Note);
        self.timeStamp = ko.observable(DE.utilities.formatHandler(data.NoteDate, { format: "dateTime" }));
        self.by = ko.observable(data.UserName);
    } else {
        self.comment = ko.observable();
        self.timeStamp = ko.observable();
        self.by = ko.observable();
    }
};
var processFundingDetail = function (data, item) {
    var self = this,
		verificationData = data,
		isDecisionBinded = false,
		isDisplayed = false,
        normalizeVerificationObject = function () {
            var result = ko.observableArray([]); // array of Header+Item pairs.

            $.each(self.Verifications, function () {
                var headerValue = this.VerificationGroupHeader.itemValue();
                var headerItem = _.find(result(), function (element) {
                    return element.Header === headerValue;
                });

                if (!headerItem) {
                    headerItem = { Header: this.VerificationGroupHeader.itemValue(), Items: [] };
                    result.push(headerItem);
                }

                var itemValue = this.VerificationSubgroupHeader.itemValue();
                var item = _.find(headerItem.Items, function (element) {
                    return element.SubHeader === itemValue;
                });

                if (!item) {
                    item = { SubHeader: this.VerificationSubgroupHeader.itemValue(), Details: [] };
                    headerItem.Items.push(item);
                }

                item.Details.push({
                    Description: this.VerificationDescription.itemValue(),
                    Status: this.Status.itemValue(),
                    LastUpdate: this.LastUpdate.itemValue(),
                    Style: self.applicationVerificationStyleMap[this.Status.itemValue()].style
                });
            });
            return result;
        };

    self.populateRecursive(self, verificationData);
    self.populateDynamic(self, this.dynamicFields);
    self.isDecisionVisible = ko.observable(false);
    self.isLeaseApplication = ko.observable(self.Structure.IsLease.itemValue());
    self.isCommentVisible = ko.observable(false);
    self.allComments = ko.observableArray([]);
    self.latestComment = new CommentsCtor();
    self.approvalFee = ko.observable();
    self.adjustedFee = ko.observable();
    self.feeVarianceVisible = ko.computed(function () {
        return item.status() === "Funded" || item.status() === "Purchased" || item.status() === "Discrepancy";
    });

    self.onlatestCommentSuccess = function (response) {
        self.isCommentVisible(DE.utilities.checkEmptyNullServerResponse(response));
        if (self.isCommentVisible()) {
            self.latestComment.comment(response.Note);
            self.latestComment.timeStamp(DE.utilities.formatHandler(response.NoteDate, { format: "dateTime" }));
            self.latestComment.by(response.UserName);
        }
    };
    self.onAllCommentSuccess = function (response) {
        self.allComments.removeAll();
        $.each(response, function (key, val) {
            self.allComments.push(new CommentsCtor(val));
        });
        $("#eComments-modal").modal("show");
    };
    self.bindStructureTemplate = function () {
        if (self.isLeaseApplication()) {
            return 'leaseStructureTemplate';
        }
        else {
            return 'normalStructureTemplate';
        }
    };
    self.showAllComments = function () {
        DE.proxy.getAllNotes(item.appId(), "eComment", self.onAllCommentSuccess);
    };
    self.showHideAppDetails = function (status) {
        if (status === "Pending" && $("#vendorDetails span").text().split(' ')[0] !== "CARMAX") {
            $("#pendingMessage").show();
            $("#appDetails").hide();
        } else {
            $("#pendingMessage").hide();
            $("#appDetails").show();
        }
        if (self.isLeaseApplication()) {
            if (status === "Funded" || status === "Purchased") {
                $("#show-last-approval").hide();
                $("#show-purchase-letter").show().attr('disabled', false);
            }
            else {
                $("#show-last-approval").show();
                $("#show-purchase-letter").hide().attr('disabled', 'disabled');
            }
        }
        else {
            if (status === "Funded" || status === "Purchased") {
                $("#show-last-approval").hide();
                $("#show-purchase-letter").show().attr('disabled', false);
            }
            else {
                $("#show-last-approval").show();
                $("#show-purchase-letter").hide();
            }
        }
    };
    self.showContactFunderModal = function () {
        $('#contact-funder-modal').modal('show');
        $('#contact-funder-modal .modal-body').css({
            'max-height': 'none',
            'height': 'auto'
        });
    };
    self.loadApprovalData = function (id) {
        var childModel = viewModelFactory("lastApproval");
        processLastApproval.call(childModel, id);
        isDecisionBinded = true;
    };
    self.showDiscountVarianceModal = function () {
        $('#discount-variance-modal').modal('show');
        var __fundingDiscountVariance = new FundingDiscountVariance($('#appId').val());
        ko.applyBindings(__fundingDiscountVariance, document.getElementById("discountVariance"));
    };
    self.bindApprovalSection = function () {
        if (isDecisionBinded === false) {
            self.loadApprovalData($('#appId').val());
        }
        if (isDisplayed == false) {
            $("#show-last-approval").html('<i class="icon-file"></i> Show Funding Summary');
            $('#funding-summary').hide();
            $('#lastApproval').show();
            isDisplayed = true;
        } else {
            $("#show-last-approval").html('<i class="icon-file"></i> Show Last Approval');
            $('#lastApproval').hide();
            $('#funding-summary').show();
            isDisplayed = false;
        }
    };
    self.bindPurchaseSection = function () {
        if (self.Summary.Status.itemValue() === "Funded" || self.Summary.Status.itemValue() === "Purchased") {
            if (isDecisionBinded === false) {
                self.loadApprovalData($('#appId').val());
            }
            if (isDisplayed == false) {
                $("#show-purchase-letter").html('<i class="icon-file"></i> Show Funding Summary');
                $('#funding-summary').hide();
                $('#purchase').show();
                if (self.isLeaseApplication()) {
                    $("#purchaseLetter").hide();
                    $("#leasePurchaseLetter").show();
                    $("#normalPurchaseHeader").hide();
                    $("#leasePurchaseHeader").show();
                } else {
                    $("#purchaseLetter").show();
                    $("#leasePurchaseLetter").hide();
                    $("#normalPurchaseHeader").show();
                    $("#leasePurchaseHeader").hide();
                }
                isDisplayed = true;
            } else {
                $("#show-purchase-letter").html('<i class="icon-file"></i> Show Purchase Letter');
                $('#purchase').hide();
                $('#funding-summary').show();
                isDisplayed = false;
            }
        }
    };
    self.showHideAppDetails(item.status());
    self.normalizedVerifications = normalizeVerificationObject();
    self.header = ko.computed(function () {
        return self.Header.ApplicationID.itemValue() + " " + self.Header.PrimaryApplicant.itemValue() + " " + self.Header.CoApplicant.itemValue() + " " + self.Header.LastModifiedTimestamp.itemValue();
    });

    self.approvalFee(verificationData.FinalDiscountAmount.StatedFormattedValue);
    self.adjustedFee(verificationData.FinalDiscountAmount.ActualFormattedValue);

    if (self.Summary.Status.itemValue() === "Discrepancy") {
        DE.proxy.getLatestNote(item.appId(), "eComment", self.onlatestCommentSuccess);
    }
};


/* Last Apporval */

var processLastApproval = function (id) {
    var self = this;

    self.vendorId = ko.observable(DE.utilities.readCookie("DealerID"));

    self.loadData = function (data) {
        self.populateRecursive(self, data);
        self.populateDynamic(self, self.dynamicFields);
        self.stipulationData = self.toObservableArray(self.Stipulations);
        self.commentData = self.toObservableArray(self.Notes);

        if (self.stipulationData().length === 1 && self.stipulationData()[0].itemValue() === "-") {
            self.stipulationData()[0].itemValue("NA");
        }
        if (self.commentData().length === 1 && self.commentData()[0].itemValue() === "-") {
            self.commentData()[0].itemValue("NA");
        }
        ko.applyBindings(self, document.getElementById("decision"));
        applySiteSettings(DE.lookups.siteSettingsParams);
    };
	DE.proxy.getDecisionDetail(id, self.loadData);
};

/* Funding Discount Variance */

var FundingDiscountVariance = function (id) {
    var self = this,
        varianceDiff,
        loadData = function (data) {
            var result = [];
            $.each(data, function (key, val) {
                if (key !== "FundingAdjustmentFee" && key !== "FinalDiscountAmount") {
                    var itemValue = val.VarianceItem,
                    item = _.find(result, function (element) {
                        return element.Header === itemValue;
                    });

                    if (!item) {
                        item = { Header: val.VarianceItem, Details: {} };
                        result.push(item);
                    }

                    item.Details = {
                        varianceItem: val.VarianceItem,
                        statedValue: val.StatedFormattedValue,
                        actualValue: val.ActualFormattedValue
                    };
                }
            });
            return result;
        };

    self.varianceData = ko.observableArray([]);
    self.finalDiscountAmount = ko.observable();
    self.checkToBind = ko.observable(false);
    self.fundingAdjustmentFee = new ObservableObjectViewModel();
    self.onSuccess = function (response) {
        self.varianceData(loadData(response));
        varianceDiff = parseFloat(response.FinalDiscountAmount.ActualValue) - parseFloat(response.FinalDiscountAmount.StatedValue);
        varianceDiff = varianceDiff > 0 ? DE.utilities.formatHandler(varianceDiff, { format: "price" }) : "$0.00";
        self.finalDiscountAmount(varianceDiff);
        self.fundingAdjustmentFee.dataAttributes = DE.lookups.formattedData.fundingAdjusmentFee;
        self.fundingAdjustmentFee.populateRecursive(self.fundingAdjustmentFee, response.FundingAdjustmentFee);
        self.fundingAdjustmentFee.populateDynamic(self.fundingAdjustmentFee, DE.lookups.dynamic.fundingAdjustmentFee);
        self.checkToBind(true);
    };
	DE.proxy.getFundingDiscountVariance(id, self.onSuccess);
};

/* Contact Funder Modal */

var ContactFunderFormViewModel = function (item) {
    var self = this;
    self.applicationId = ko.observable(item.appId());
    self.applicantName = ko.observable(item.name());
    self.agentName = ko.observable().extend({ minLength: 2, required: true });
    self.email = ko.observable().extend({ required: true, email: true });
    self.selectedSubject = ko.observable().extend({ required: true });
    self.subject = ko.observableArray([
					"Deal Status",
					"Updated/New Information",
					"Questions/Concerns",
					"Other"
					]);
    self.message = ko.observable().extend({ required: true, minLength: 2 });
    self.feedback = {
        text: ko.observable(),
        isVisible: ko.observable(false),
        feedbackClass: ko.observable()
    };

    self.errors = ko.validation.group(self);

    self.onLoad = function () {
        if (self.feedback.text() !== "") {
            self.feedback.text("");
            self.feedback.isVisible(false);
            self.feedback.feedbackClass("");
            self.errors.showAllMessages(false);
        }
    };
	self.onSuccess = function () {
        self.feedback.isVisible(true);
        self.feedback.feedbackClass("text-success");
        self.feedback.text("Thank you for reaching out. Your message has been posted successfully.");
        self.resetForm();
    };
	self.onFailure = function () {
        self.feedback.isVisible(true);
        self.feedback.feedbackClass("text-error");
        self.feedback.text("We are sorry. The message HAS NOT been posted due to some error. Please try again later.");
    };
	self.sendMessage = function () {
        var subject = self.selectedSubject() + " - Application Id: " + self.applicationId(),
            financeCompany = DE.utilities.readCookie("FinanceCompanyId") ? DE.utilities.readCookie("FinanceCompanyId") : undefined,
            clientPartner = DE.utilities.readCookie("CreditPartnerID") ? DE.utilities.readCookie("CreditPartnerID") : undefined;
        if (_.isEmpty(self.errors())) {
            var message = {
                //            "applicationId": self.applicationId(),
                //            "applicantName": self.applicantName(),
                "DealerId": self.applicationId(),
                "FullName": self.agentName(),
                "EmailAddress": self.email(),
                "Subject": subject,
                "Message": self.message(),
                "FinanceCompanyId": financeCompany,
                "ClientPartnerId": clientPartner
            };
            DE.proxy.postContactFunder(ko.toJSON(message), self.onSuccess, self.onFailure);
        }
        else {
            self.errors.showAllMessages();
        }
    };
	self.resetForm = function () {
        self.agentName("");
        self.email("");
        self.selectedSubject(null);
        self.message("");
        self.errors.showAllMessages(false);
    };
	self.cancel = function () {
        self.resetForm();
        self.onLoad();
        $('#contact-funder-modal').modal('hide');
    };
	$('#contact-funder-modal').on('hidden', function () {
        self.cancel();
    });
};

/* Upload Images View Model */

var FundingRecentDocuments = function (data) {
    var self = this,
		date = moment(data.Revision).format("MM-DD-YYYY, h:mm a");
    self.document = {
        appId: ko.observable(data.ApplicationID),
        description: ko.observable(data.Description),
        revision: ko.observable(data.Revision),
        revDate: ko.observable(date)
    };
    self.view = function (data, event) {
        var target = (event.currentTarget) ? event.currentTarget : event.srcElement,
			attributes = {
			    ApplicationID: target.getAttribute("data-id"),
			    GroupName: target.getAttribute("data-desc").toString(),
			    Revision: target.getAttribute("data-time").toString()
			};
        DE.proxy.postValidateFundingDocument(ko.toJSON(attributes), self.onSuccess, self.onFailure);
    };
	self.onSuccess = function (response) {
        $('#serverDocumentError').hide();
        var document = {
            ApplicationID: response.ApplicationID,
            GroupName: response.GroupName,
            Revision: response.Revision
        },
        urlAssigned = "api/download/viewfundingdocument?";
        window.location.href = urlAssigned + $.param(document);
    };
	self.onFailure = function () {
        $('#serverDocumentError').show();
    };
};
var FundingUploadImageViewModel = function (item) {
    var self = this,
    fundingRecentUploads = [
        {
            "Description": "",
            "DocumentCategory": "",
            "Revision": ""
        }
    ];
    self.applicationId = ko.observable(item.appId());
    self.category = ko.observableArray([]);
    self.categoryValue = ko.observable();
    $("#validationError").hide();

    self.onCategoryServiceSuccess = function (response) {
        self.loadCategoryData(response);
    };
	self.loadCategoryData = function (data) {
        $.each(data, function () {
            self.category.push(this);
        });
    };
	self.appIdValue = ko.computed(function () {
        return self.applicationId();
    });

    self.recentDocuments = ko.observableArray([]);
    $('#serverDocumentError').hide();

    self.onRecentDocumentServiceSuccess = function (response) {
        if (DE.utilities.checkEmptyNullServerResponse(response)) {
            self.addRecentDocuments(response);
            $("#errorRecentDocuments").hide();
            $("#successRecentDocuments").show();
            $("#upload-modal-section ul").css({ "list-style": "none" });
        }
        else {
            self.recentDocuments.push(new FundingRecentDocuments(fundingRecentUploads));
            $("#errorRecentDocuments").show();
            $("#successRecentDocuments").hide();
        }
        $("#upload-modal-section").modal('show');
    };
	self.addRecentDocuments = function (data) {
        $.each(data, function () {
            self.recentDocuments.push(new FundingRecentDocuments(this));
        });
    };
	self.uploadFileInit = new qq.FineUploader({
        element: document.getElementById('file-uploader'),
        request: {
            endpoint: '/funding/uploadfundingdocument',
            forceMultipart: true,
            params: {
                'appid': self.appIdValue,
                'categoryname': function () {
                    return $("#uploadCategory option:selected").text();
                }
            }
        },
        validation: {
            allowedExtensions: ['pdf', 'tif', 'tiff', 'bmp', 'png', 'gif', 'jpeg', 'jpg'],
            sizeLimit: 204800000 // 200 MB = 200,000 * 1024 bytes
        },
        text: {
            uploadButton: '<i class="icon-upload icon-white"></i> Upload a file...'
        },
        template: '<div class="qq-uploader span12">' +
						'<pre class="qq-upload-drop-area span12"><span>{dragZoneText}</span></pre>' +
						'<div class="qq-upload-button btn btn-success" style="width: auto;">{uploadButtonText}</div>' +
						'<ul class="qq-upload-list" style="margin-top: 10px; text-align: center;"></ul>' +
					'</div>',
        classes: {
            success: 'alert alert-success',
            fail: 'alert alert-error'
        },
        callbacks: {
            onSubmit: function (id, fileName, responseJSON) {
                var selected = $("#uploadCategory").val();
                if (selected === "") {
                    $("#validationError").show();
                    return false;
                }
                else {
                    $("#validationError").hide();
                    $(this).fineUploader();
                }
            }
        },
        debug: true
    });

    self.uploadFile = function () {
        self.uploadFileInit.uploadStoredFiles();
    };

    self.resetForm = function () {
        $("#successRecentDocuments").html("");
        self.category([]);
        self.recentDocuments([]);
        $("#validationError").hide();
    };

    self.cancel = function () {
        self.resetForm();
        $('#serverDocumentError').hide();
        $('#upload-modal-section').modal('hide');
    };

    $('#upload-modal-section').on('hidden', function () {
        self.cancel();
    });

    self.initializeUploadModal = function () {
        DE.proxy.getCategoryData(self.onCategoryServiceSuccess);
        DE.proxy.getRecentDocument(self.applicationId(), self.onRecentDocumentServiceSuccess);
        return true;
    };
};
/* Application Details */

var processApplicationDetail = function (data, item) {
    var self = this,
		isRehashDisplayed = false,
        webRoleId = DE.utilities.readCookie("WebRoleID"),
		appStatus,
		applicationData = data;

    self.isConditionedVisible = ko.observable(false);
    self.isDeclinedVisible = ko.observable(true);
    self.isLeaseVisible = ko.observable(false);
    self.isChryslerVisible = ko.observable(DE.utilities.readCookie("FinanceCompanyId") === "8");
    self.isOEMVisible = ko.observable(false);

    self.checkToBind = ko.computed(function () {
        var isDecisionThere = DE.utilities.checkEmptyNullServerResponse(applicationData.Summary.Decision),
            isFinancingThere = isDecisionThere ? DE.utilities.checkEmptyNullServerResponse(applicationData.Summary.Decision.Financing) : false;
        return isDecisionThere && isFinancingThere;
    });

    self.isHyundai = ko.computed(function () {
        var result = false;
        if (webRoleId == "41" || webRoleId == "42") {
            result = true;
        }
        return result;
    });

    self.sGuardLink = ko.computed(function () {
        return "http://sguard.efgcompanies.com/RatingEngine.aspx?VID=" + __slideDeckItems.vendorId();
    });

    self.populateRecursive(self, applicationData);
    self.populateDynamic(self, this.dynamicFields);
    self.header = ko.computed(function () {
        return self.Header.ApplicationID.itemValue() + " " + self.Header.PrimaryApplicant.itemValue() + " " + self.Header.CoApplicant.itemValue() + " " + self.Header.LastModifiedTimestamp.itemValue();
    });
    self.isRehashVisible = ko.computed(function () {
        return self.Summary.RehashEnabled.itemValue() === "True";
    });

    self.loadRehashData = function (id) {
        var childModel = viewModelFactory();
        processRehashCalculator.call(childModel, id, item, "application");
    };
	self.printDecision = function () {
        DE.print.printDecision(['decision', 'funding-checklist']);
    };
	self.bindRehashSection = function () {
        if (isRehashDisplayed == false) {
            self.loadRehashData($('#appId').val());
            $("#show-rehash-calculator").html('<i class="icon-file"></i> Show Deal Info');
            $('#application-summary, #decision').hide();
            $('#show-rehash-calculator').removeClass('btn-primary');
            $('#rehash-calculator').show();
            hideSidebar();
            $('.show-deck').hide();
            $('.hide-deck').hide();
            $("#headerPrimaryNavigation").hide();
            $("#vendorDetails").hide();
            $("#headerSecondaryNavigation").hide();
            $("#footerNavigation").hide();
            $("#adminBar").hide();
            $("#logoSection a").on("click", function () { event.preventDefault(); });
            isRehashDisplayed = true;
        } else {
            $("#modal-warning").modal('show');
        }
    };
	
	if (DE.utilities.checkEmptyNullServerResponse(self.Summary.Decision)) {
        self.stipulationData = self.toObservableArray(self.Summary.Decision.Stipulations);
        self.commentData = self.toObservableArray(self.Summary.Decision.Notes);

        if (self.stipulationData().length === 1 && self.stipulationData()[0].itemValue() === "-") {
            self.stipulationData()[0].itemValue("NA");
        }
        if (self.commentData().length === 1 && self.commentData()[0].itemValue() === "-") {
            self.commentData()[0].itemValue("NA");
        }

        if (self.Summary.IsCommercialApplication.itemValue()) {
            self.Summary.Decision.Applicant.FullName.itemValue(self.Summary.BusinessName.itemValue());
        }

        appStatus = self.Summary.Decision.ApplicationStatus.itemValue();
        if (appStatus === "Conditioned") {
            self.isConditionedVisible(true);
        }
        if (appStatus === "Declined" || appStatus === "Cancelled" || appStatus === "Rejected") {
            self.isDeclinedVisible(false);
        }
        self.isLeaseVisible(self.Summary.IsLeaseApplication.itemValue());
    }

    self.showContactAnalystModal = function () {
        $('#contact-analyst-modal').modal('show');
        $('#contact-analyst-modal .modal-body').css({
            'max-height': 'none',
            'height': 'auto'
        });
    };
};

var rehashRedirect = {
    "application": {
        buttonName: "#show-rehash-calculator",
        divElementToShow: "#application-summary, #decision"
    },
    "leads": {
        buttonName: "#showRehashBtn",
        divElementToShow: "#leadDetails"
    }
};

var processRehashCalculator = function (id, item, module) {
    var self = this,
        userId = DE.utilities.readCookie("UserID"),
		lastApprovalData,
		copied = false,
        hasRequiredValidationError = false,
		rehashObjectStructure,
		finalizeApplicationId,
		finalizeRecommendationId,
		rehashObjectApplicationId = {},
        valuationUpperCase = function (data) {
            var LastApprovalValuationSource = data.LastApproval.VehicleInformation.ValuationSourceValue,
                RehashValuationSource = data.RehashStructure.VehicleInformation.ValuationSourceValue;
            LastApprovalValuationSource.Value = LastApprovalValuationSource.Value.toUpperCase();
            LastApprovalValuationSource.ValueFormatted = LastApprovalValuationSource.ValueFormatted.toUpperCase();
            RehashValuationSource.Value = RehashValuationSource.Value.toUpperCase();
            RehashValuationSource.ValueFormatted = RehashValuationSource.ValueFormatted.toUpperCase();
        };

    self.isScusaAdmin = function () {
        return DE.utilities.readCookie("WebRoleID") === "6";
    };
	self.canHideFinalizeRehashButton = ko.observable(true);
    self.rehashOutputStructureWithBaseValues = {};
    self.rehashOutputStructureWithFormattedValues = {};
    self.rehashOutputStructureWithTooltipDisplayMessage = {};
    self.validationResults = ko.observableArray([]);
    self.vinValidated = ko.observable();
    self.trimFromVinExists = ko.observable();
    self.rehashInputStructure = {
        vehicleYear: ko.observableArray([]),
        vehicleMake: ko.observableArray([]),
        vehicleModel: ko.observableArray([]),
        vehicleTrim: ko.observableArray([]),
        vehicleCondition: ko.observableArray([]),
        vehicleValuation: ko.observableArray([]),
        selectedVehicleYear: ko.observable(),
        selectedVehicleMake: ko.observable(),
        selectedVehicleModel: ko.observable(),
        selectedVehicleTrim: ko.observable(),
        selectedVehicleCondition: ko.observable(),
        selectedVehicleValuation: ko.observable(),
        isVehicleYearValid: ko.observable(true),
        isVehicleMakeValid: ko.observable(true),
        isVehicleModelValid: ko.observable(true),
        isVehicleTrimValid: ko.observable(true),
        isVehicleConditionValid: ko.observable(true),
        isVehicleValuationValid: ko.observable(true),
        isVehicleBookValueValid: ko.observable(true),
        isVehicleMileageValid: ko.observable(true),
        isDealCashPriceValid: ko.observable(true),
        isDealTermValid: ko.observable(true),
        isFormHasError: ko.observable(false)
    };

    self.rehashPreFinalizeStructureWithBaseValues = {};
    self.rehashPreFinalizeStructureWithFormattedValues = {};

    self.initialCopyApplicantIncomeFromInputToOutput = function () {
        var incomeInfo = self.rehashInputStructure.ApplicantIncome;
        incomeInfo.ApplicantOtherIncome.Value(self.rehashOutputStructureWithBaseValues.ApplicantOtherIncome());
        incomeInfo.ApplicantPrimaryIncome.Value(self.rehashOutputStructureWithBaseValues.ApplicantPrimaryIncome());
        incomeInfo.CoApplicantOtherIncome.Value(self.rehashOutputStructureWithBaseValues.CoApplicantOtherIncome());
        incomeInfo.CoApplicantPrimaryIncome.Value(self.rehashOutputStructureWithBaseValues.CoApplicantPrimaryIncome());
        incomeInfo.TotalIncome.Value(self.rehashOutputStructureWithBaseValues.TotalIncome());
        incomeInfo.TotalIncome.ValueFormatted(self.rehashOutputStructureWithFormattedValues.TotalIncome());
    };
	self.loadLastApprovalData = function (data) {
        rehashObjectStructure = data;
        valuationUpperCase(data);
        self.flattenObjectToKeyValue(self.rehashOutputStructureWithFormattedValues, data.LastApproval, "ValueFormatted");
        self.flattenObjectToKeyValue(self.rehashOutputStructureWithBaseValues, data.LastApproval, "Value");
        self.flattenObjectToKeyValue(rehashObjectApplicationId, data, "ApplicationId");
        self.populateRehashRecursive({ target: self.rehashInputStructure, data: data.RehashStructure });
        self.initialCopyApplicantIncomeFromInputToOutput();
        self.loadDropDown(self.rehashInputStructure.vehicleValuation, data.ValuationSources);
        ko.applyBindings(self, document.getElementById("rehash-calculator"));
    };
	self.loadDropDown = function (arr, data) {
        var temp = [];
        $.each(data, function (i, val) {
            val = val.toUpperCase();
            temp.push({ id: val, text: val });
        });
        arr(temp);
    };
	self.onYearSuccess = function (response) {
        self.loadDropDown(self.rehashInputStructure.vehicleYear, response);
        if (copied) {
            self.rehashInputStructure.selectedVehicleYear(self.rehashInputStructure.VehicleInformation.Year.Value());
        }
    };
	self.onMakeSuccess = function (response) {
        self.loadDropDown(self.rehashInputStructure.vehicleMake, response);
        if (copied) {
            self.rehashInputStructure.selectedVehicleMake(self.rehashInputStructure.VehicleInformation.Make.Value());
        }
    };
	self.onModelSuccess = function (response) {
        self.loadDropDown(self.rehashInputStructure.vehicleModel, response);
        if (copied) {
            self.rehashInputStructure.selectedVehicleModel(self.rehashInputStructure.VehicleInformation.Model.Value());
        }
    };
	self.onTrimSuccess = function (response) {
        self.loadDropDown(self.rehashInputStructure.vehicleTrim, response);
        if (copied) {
            self.rehashInputStructure.selectedVehicleTrim(self.rehashInputStructure.VehicleInformation.Trim.ValueFormatted());
        }
    };
	self.onConditionSuccess = function (response) {
        self.loadDropDown(self.rehashInputStructure.vehicleCondition, response);
    };
	self.onCalculateSuccess = function (response) {
        var vinValidFlag = response.RehashStructure.VehicleInformation.VehicleIdentificationNumber.IsValueValid,
            vehicleYear = response.RehashStructure.VehicleInformation.Year.Value,
            selectedVehicleCondition = self.rehashInputStructure.selectedVehicleCondition();
        self.vinValidated(vinValidFlag === "True" && DE.utilities.vehicleAgeChecker(selectedVehicleCondition, "NEW", vehicleYear));
        if (self.vinValidated()) {
            copied = true;
            self.rehashInputStructure.selectedVehicleYear(response.RehashStructure.VehicleInformation.Year.Value);
            self.rehashInputStructure.selectedVehicleMake(response.RehashStructure.VehicleInformation.Make.Value.toUpperCase());
            self.rehashInputStructure.selectedVehicleModel(response.RehashStructure.VehicleInformation.Model.Value.toUpperCase());
            self.trimFromVinExists(_.isEmpty(_.findWhere(self.rehashInputStructure.vehicleTrim(), { id: response.RehashStructure.VehicleInformation.Trim.Value.toUpperCase() })) === false);
            if (self.trimFromVinExists()) self.rehashInputStructure.selectedVehicleTrim(response.RehashStructure.VehicleInformation.Trim.Value.toUpperCase());
            copied = false;
        }
        else {
            response.RehashStructure.VehicleInformation.VehicleIdentificationNumber.IsValueValid = "False";
            response.RehashStructure.VehicleInformation.VehicleIdentificationNumber.VinType = "InvalidVin";
        }
        self.copyNewObjectValueToOldObservableObject(self.rehashInputStructure, response.RehashStructure);
    };
	self.onCopySuccess = function (response) {
        copied = true;
        valuationUpperCase(response);
        var valuationSourceValue = response.RehashStructure.VehicleInformation.ValuationSourceValue.Value;
        self.copyNewObjectValueToOldObservableObject(self.rehashInputStructure, response.RehashStructure);
        self.rehashInputStructure.selectedVehicleCondition(response.RehashStructure.VehicleInformation.Condition.Value);
        self.rehashInputStructure.selectedVehicleYear(response.RehashStructure.VehicleInformation.Year.Value);
        self.rehashInputStructure.selectedVehicleMake(response.RehashStructure.VehicleInformation.Make.Value);
        self.rehashInputStructure.selectedVehicleModel(response.RehashStructure.VehicleInformation.Model.Value);
        self.rehashInputStructure.selectedVehicleTrim(response.RehashStructure.VehicleInformation.Trim.Value);
        _.isNull(valuationSourceValue) ?
            self.rehashInputStructure.selectedVehicleValuation("") :
            self.rehashInputStructure.selectedVehicleValuation(response.RehashStructure.VehicleInformation.ValuationSourceValue.Value);
        self.validateTextFields();
        copied = false;
    };
	self.onGetRehashWebPermissionsSuccess = function (response) {
        self.canHideFinalizeRehashButton = ko.observable(response.CanHideFinalizeRehashButton);
    };
	self.onResetRehashSuccess = function (response) {
        self.copyNewObjectValueToOldObservableObject(self.rehashInputStructure, response.RehashStructure);
        self.rehashInputStructure.vehicleYear([]);
        self.rehashInputStructure.vehicleMake([]);
        self.rehashInputStructure.vehicleModel([]);
        self.rehashInputStructure.vehicleTrim([]);
        self.rehashInputStructure.selectedVehicleYear(null);
        self.rehashInputStructure.selectedVehicleMake(null);
        self.rehashInputStructure.selectedVehicleModel(null);
        self.rehashInputStructure.selectedVehicleTrim(null);
        self.rehashInputStructure.selectedVehicleCondition(null);
        self.rehashInputStructure.selectedVehicleValuation(null);
        self.initialCopyApplicantIncomeFromInputToOutput();
        self.validateTextFields();
    };
	self.onRehashSuccess = function (response) {
        self.rehashStips = ko.observableArray(response.Stipulations);
        valuationUpperCase(response);
        var valuationSourceValue = response.RehashStructure.VehicleInformation.ValuationSourceValue.Value;
        self.copyNewObjectValueToOldObservableObject(self.rehashInputStructure, response.RehashStructure);
        self.rehashInputStructure.selectedVehicleCondition(response.RehashStructure.VehicleInformation.Condition.Value);
        _.isNull(valuationSourceValue) ?
            self.rehashInputStructure.selectedVehicleValuation("") :
            self.rehashInputStructure.selectedVehicleValuation(response.RehashStructure.VehicleInformation.ValuationSourceValue.Value);
        if (response.ApplicationStatusId === 3) {
            finalizeApplicationId = response.RehashStructure.ApplicationId;
            finalizeRecommendationId = response.RehashStructure.RecommendationId;
            ko.applyBindings(self, document.getElementById('modal-rehash-final-approval'));
            $('#modal-rehash-final-approval').modal('show');
            $('#modal-rehash-final-decline').modal('hide');
        }
        else {
            $('#modal-rehash-final-approval').modal('hide');
            $('#modal-rehash-final-decline').modal('show');
        }
    };
	self.cancelRehashApproval = function () {
        $('#modal-rehash-final-approval').modal('hide');
    };
	self.onFinalizeSuccess = function (response) {
        $('#modal-rehash-final-approval').modal('hide');
        $('#rehash-calculator').hide();
        $(rehashRedirect[module].buttonName).addClass('btn-primary');
        self.redirectRehashHandler();
    };
	self.sGuardLink = ko.computed(function () {
        return "http://sguard.efgcompanies.com/RatingEngine.aspx?VID=" + __slideDeckItems.vendorId();
    });

    self.rehashInputStructure.selectedVehicleCondition.subscribe(function (condition) {
        if (condition) {
            DE.proxy.getVehicleYear(condition, self.onYearSuccess);
            self.rehashInputStructure.VehicleInformation.Condition.Value(condition);
        }
        else {
            self.rehashInputStructure.vehicleYear([]);
        }
        self.validateConditionDropDown();
        self.rehashInputStructure.selectedVehicleYear(undefined);
        self.rehashInputStructure.VehicleInformation.VehicleIdentificationNumber.Value("");
    });

    self.rehashInputStructure.selectedVehicleYear.subscribe(function (year) {
        if (year) {
            var condition = self.rehashInputStructure.selectedVehicleCondition();
            DE.proxy.getVehicleMake(year, self.onMakeSuccess);
            self.rehashInputStructure.VehicleInformation.Year.Value(year);
        }
        else {
            self.rehashInputStructure.vehicleMake([]);
        }
        self.validateYearDropDown();
        self.rehashInputStructure.selectedVehicleMake(undefined);
    });

    self.rehashInputStructure.selectedVehicleMake.subscribe(function (make) {
        if (make) {
            var year = self.rehashInputStructure.selectedVehicleYear();
            if (year) {
                DE.proxy.getVehicleModel(year, make, self.onModelSuccess);
                self.rehashInputStructure.VehicleInformation.Make.Value(make);
            }
        }
        else {
            self.rehashInputStructure.vehicleModel([]);
        }
        self.validateMakeDropDown();
        self.rehashInputStructure.selectedVehicleModel(undefined);
    });

    self.rehashInputStructure.selectedVehicleModel.subscribe(function (model) {
        if (model) {
            var year = self.rehashInputStructure.selectedVehicleYear(),
			    make = self.rehashInputStructure.selectedVehicleMake();
            if (year && make) {
                DE.proxy.getVehicleTrim(year, make, model, self.onTrimSuccess);
                self.rehashInputStructure.VehicleInformation.Model.Value(model);
            }
        }
        else {
            self.rehashInputStructure.vehicleTrim([]);
        }
        self.validateModelDropDown();
        self.rehashInputStructure.selectedVehicleTrim(undefined);
    });

    self.rehashInputStructure.selectedVehicleTrim.subscribe(function (model) {
        self.validateTrimDropDown();
    });

    self.rehashInputStructure.selectedVehicleValuation.subscribe(function (model) {
        self.validateValuationDropDown();
    });

    self.validateField = function (options) {
        var result,
            field = options.field,
            type = options.type,
            name = options.name,
            actionElement = options.actionElement,
            validationRules = {
                "required": function (field) {
                    return (_.isNull(field) === false && field !== "" && _.isUndefined(field) === false);
                },
                "number": function (field) {
                    var pattern = /^[0-9][\S]*$/;
                    return (pattern.test(field));
                }
            },
            storeResult = function (validatedfield, result) {
                if (_.isUndefined(result) === false) {
                    if (_.isEmpty(_.findWhere(self.validationResults(), { name: validatedfield }))) {
                        self.validationResults.push({ name: validatedfield, valid: result });
                    }
                    else {
                        $.each(self.validationResults(), function (k, v) {
                            if (v.name === validatedfield) {
                                v.valid = result;
                            }
                        });
                    }
                }
            },
            validate = function (validationTypes) {
                $.each(validationTypes, function (key, val) {
                    if (val) {
                        storeResult(name, validationRules[key](field));
                    }
                });
                postValidate(actionElement);
            },
            postValidate = function (el) {
                el(_.some(self.validationResults(), function (val) {
                    return val.name === name && val.valid === false;
                }) === false);
            };
	    validate(type);
    };
	self.rehashInputStructure.selectedVehicleTrim.subscribe(function (trim) {
        self.rehashInputStructure.VehicleInformation.Trim.Value(trim);
    } .bind(self));

    self.rehashInputStructure.selectedVehicleCondition.subscribe(function (condition) {
        self.rehashInputStructure.VehicleInformation.Condition.Value(condition);
    } .bind(self));

    self.rehashInputStructure.selectedVehicleValuation.subscribe(function (valuation) {
        self.rehashInputStructure.VehicleInformation.ValuationSourceValue.Value(valuation);
    } .bind(self));

    self.copyLastApproval = function () {
        var appId = rehashObjectApplicationId.LastApproval();
        DE.proxy.getRehashCopy(appId, self.onCopySuccess);
    };
	self.showWarningIcon = function () {
        return self.rehashInputStructure.ApplicantIncome.ApplicantPrimaryIncome.IsValueValid() === "False";
    };
	self.validateTextFields = function () {
        self.validateField({
            field: self.rehashInputStructure.VehicleInformation.Mileage.Value(),
            name: "mileage",
            type: { "required": true, "number": true },
            actionElement: self.rehashInputStructure.isVehicleMileageValid
        });
        self.validateField({
            field: self.rehashInputStructure.VehicleInformation.BookValue.Value(),
            name: "bookValue",
            type: { "required": true, "number": true },
            actionElement: self.rehashInputStructure.isVehicleBookValueValid
        });
        self.validateField({
            field: self.rehashInputStructure.DealStructure.CashPrice.Value(),
            name: "cashPrice",
            type: { "required": true },
            actionElement: self.rehashInputStructure.isDealCashPriceValid
        });
        self.validateField({
            field: self.rehashInputStructure.DealStructure.Term.Value(),
            name: "term",
            type: { "required": true },
            actionElement: self.rehashInputStructure.isDealTermValid
        });
    };
	self.validateConditionDropDown = function () {
        self.validateField({
            field: self.rehashInputStructure.selectedVehicleCondition(),
            name: "vehicleCondition",
            type: { "required": true },
            actionElement: self.rehashInputStructure.isVehicleConditionValid
        });
    };
	self.validateYearDropDown = function () {
        self.validateField({
            field: self.rehashInputStructure.selectedVehicleYear(),
            name: "vehicleYear",
            type: { "required": true },
            actionElement: self.rehashInputStructure.isVehicleYearValid
        });
    };
	self.validateMakeDropDown = function () {
        self.validateField({
            field: self.rehashInputStructure.selectedVehicleMake(),
            name: "vehicleMake",
            type: { "required": true },
            actionElement: self.rehashInputStructure.isVehicleMakeValid
        });
    };
	self.validateModelDropDown = function () {
        self.validateField({
            field: self.rehashInputStructure.selectedVehicleModel(),
            name: "vehicleModel",
            type: { "required": true },
            actionElement: self.rehashInputStructure.isVehicleModelValid
        });
    };
	self.validateTrimDropDown = function () {
        self.validateField({
            field: self.rehashInputStructure.selectedVehicleTrim(),
            name: "vehicleTrim",
            type: { "required": true },
            actionElement: self.rehashInputStructure.isVehicleTrimValid
        });
    };
	self.validateValuationDropDown = function () {
        self.validateField({
            field: self.rehashInputStructure.selectedVehicleValuation(),
            name: "vehicleValuation",
            type: { "required": true },
            actionElement: self.rehashInputStructure.isVehicleValuationValid
        });
    };
	self.onBlur = function () {
        var newStructure,
            vinValue = self.rehashInputStructure.VehicleInformation.VehicleIdentificationNumber.Value(),
            conditionValue = self.rehashInputStructure.VehicleInformation.Condition.Value();
        self.validateTextFields();
        newStructure = {
            RehashStructure: {
                ApplicationId: rehashObjectApplicationId.LastApproval(),
                ApplicantIncome: self.rehashInputStructure.ApplicantIncome,
                CreditPolicy: self.rehashInputStructure.CreditPolicy,
                DealStructure: self.rehashInputStructure.DealStructure,
                VehicleInformation: self.rehashInputStructure.VehicleInformation
            }
        };
		if (vinValue) {
            self.validateConditionDropDown();
            if (_.findWhere(self.validationResults(), { name: "vehicleCondition" }).valid) {
                DE.proxy.postRehashCalculate(ko.toJSON(newStructure), self.onCalculateSuccess);
            }
        }
        else DE.proxy.postRehashCalculate(ko.toJSON(newStructure), self.onCalculateSuccess);
    };
	self.submitRehash = function () {
        var newStructure = {
            RehashStructure: {
                ApplicationId: rehashObjectApplicationId.LastApproval(),
                ApplicantIncome: self.rehashInputStructure.ApplicantIncome,
                CreditPolicy: self.rehashInputStructure.CreditPolicy,
                DealStructure: self.rehashInputStructure.DealStructure,
                VehicleInformation: self.rehashInputStructure.VehicleInformation
            }
        },
        fullPageValidate = function () {
            self.validateTextFields();
            self.validateConditionDropDown();
            self.validateYearDropDown();
            self.validateMakeDropDown();
            self.validateModelDropDown();
            self.validateTrimDropDown();
            self.validateValuationDropDown();
            return (_.some(self.validationResults(), function (val) {
                return val.valid === false;
            }) === false);
        };
		self.rehashInputStructure.isFormHasError(fullPageValidate());
        if (fullPageValidate()) {
            DE.proxy.postRehashSubmit(ko.toJSON(newStructure), self.onRehashSuccess);
        }
    };
	self.resetRehash = function () {
        DE.proxy.getLastApproval(id, self.onResetRehashSuccess);
    };
	self.finalizeRehash = function () {
        var finalizeStructure = {
            ApplicationID: finalizeApplicationId,
            RecommendationID: finalizeRecommendationId,
            FinalizedApplication: {
                RehashStructure: {
                    ApplicationId: rehashObjectApplicationId.LastApproval(),
                    ApplicantIncome: self.rehashInputStructure.ApplicantIncome,
                    CreditPolicy: self.rehashInputStructure.CreditPolicy,
                    DealStructure: self.rehashInputStructure.DealStructure,
                    VehicleInformation: self.rehashInputStructure.VehicleInformation
                }
            }
        };
        DE.proxy.postRehashFinalize(ko.toJSON(finalizeStructure), self.onFinalizeSuccess);
    };
	self.rehashWarningAccept = function () {
        $("#logoSection a").off("click");
        $("#modal-warning").modal('hide');
        self.redirectRehashHandler();
    };
	self.redirectRehashHandler = function () {
        $("#headerPrimaryNavigation").show();
        $("#vendorDetails").show();
        $("#headerSecondaryNavigation").show();
        $("#footerNavigation").show();
        if (self.isScusaAdmin()) {
            $("#adminBar").show();
        };
        showSidebar();
        slideDeckItemClickHandler(item, module, __slideDeckItems.vendorId());
        $(rehashRedirect[module].buttonName).html('<i class="icon-repeat icon-white"></i> Show Rehash Calculator');
        $(rehashRedirect[module].buttonName).addClass('btn-primary');
        $('#rehash-calculator').hide();
        $(rehashRedirect[module].divElementToShow).show();
    };
	DE.proxy.getVehicleCondition(self.onConditionSuccess);
    DE.proxy.getLastApproval(id, self.loadLastApprovalData);
    DE.proxy.getRehashWebPermissions(userId, self.onGetRehashWebPermissionsSuccess);
};

/* Contact Analyst Modal */

var ContactAnalystFormViewModel = function (item) {
    var self = this;
    self.applicationId = ko.observable(item.appId());
    self.applicantName = ko.observable(item.name());
    self.message = ko.observable().extend({ required: true, minLength: 2 });
    self.feedback = {
        text: ko.observable(),
        isVisible: ko.observable(false),
        feedbackClass: ko.observable()
    };

    self.errors = ko.validation.group(self);

    self.onLoad = function () {
        if (self.feedback.text() !== "") {
            self.feedback.text("");
            self.feedback.isVisible(false);
            self.feedback.feedbackClass("");
            self.errors.showAllMessages(false);
        }
    };
	self.onSuccess = function () {
        self.feedback.isVisible(true);
        self.feedback.feedbackClass("text-success");
        self.feedback.text("Thank you for reaching out. Your message has been posted successfully.");
        self.resetForm();
    };
	self.onFailure = function () {
        self.feedback.isVisible(true);
        self.feedback.feedbackClass("text-error");
        self.feedback.text("We are sorry. The message HAS NOT been posted due to some error. Please try again later.");
    };
	self.sendMessage = function () {
        if (_.isEmpty(self.errors())) {
            var message = {
                //            "applicationId": self.applicationId(),
                //            "applicantName": self.applicantName(),
                "ApplicationId": self.applicationId(),
                "Message": self.message()
            };
            DE.proxy.postContactAnalyst(ko.toJSON(message), self.onSuccess, self.onFailure);
        }
        else {
            self.errors.showAllMessages();
        }
    };
	self.resetForm = function () {
        self.message("");
        self.errors.showAllMessages(false);
    };
	self.cancel = function () {
        self.resetForm();
        self.onLoad();
        $('#contact-analyst-modal').modal('hide');
    };
	$('#contact-analyst-modal').on('hidden', function () {
        self.cancel();
    });
};

/* Leads Details */

var LeadsDropDownViewModel = function () {
    var self = this;

    self.leadsDropdownSubject = ko.observableArray([]);

    self.onSuccess = function (response) {
        self.addDropdownItems(response);
    };
	self.addDropdownItems = function (data) {
        $.each(data, function () {
            self.leadsDropdownSubject.push(this);
        });
    };
	DE.proxy.getApplicationStatus(self.onSuccess);
};
var LeadsSaveStatusViewModel = function (item) {
    var self = this;

    self.saveStatus = function () {
        var selected = $("#leadsDropDown").val();
        if (selected === "" || selected === "0") {
            $("#validationError").show();
        }
        else {
            $("#validationError").hide();
            var status = {
                "DealerID": __slideDeckItems.vendorId(),
                "ApplicationID": item.appId(),
                "DealerApplicantStatusID": selected,
                "Comment": ""
            };
            DE.proxy.postApplicationStatus(ko.toJSON(status), self.onSuccess, self.onFailure);
        }
    };
	self.onSuccess = function () {
        $("#statusSuccess").show().css({ 'color': 'green' });
        $("#statusError").hide();
    };
	self.onFailure = function () {
        $("#statusError").show().css({ 'color': 'red' });
        $("#statusSuccess").hide();
    };
};
var processLeadDetail = function (data, item) {
    var self = this,
        isRehashDisplayed = false,
		leadsData = data,
		appStatus;

    self.isFullCreditAppVisible = ko.observable(false);
    self.isPrequalVisible = ko.observable(true);
    self.isDeclinedVisible = ko.observable(true);
    self.isVehicleNotAvailable = ko.observable(false);
    $("#statusSuccess").hide();
    $("#statusError").hide();
    $("#validationError").hide();

    self.populateRecursive(self, leadsData);
    self.populateDynamic(self, this.dynamicFields);
    self.stipulationData = self.toObservableArray(self.Stipulations);
    self.notesData = self.toObservableArray(self.OtherNotes);

    if (self.stipulationData().length === 1 && self.stipulationData()[0].itemValue() === "-") {
        self.stipulationData()[0].itemValue("NA");
    }
    if (self.notesData().length === 1 && self.notesData()[0].itemValue() === "-") {
        self.notesData()[0].itemValue("NA");
    }

    self.header = ko.computed(function () {
        return self.Header.ApplicationID.itemValue() + " " + self.Header.PrimaryApplicant.itemValue() + " " + self.Header.CoApplicant.itemValue() + " " + self.Header.LastModifiedTimestamp.itemValue();
    });

    self.isRehashVisible = ko.computed(function () {
        return self.LoanAndGuidelines.RehashEnabled.itemValue();
    });

    self.bindUpdateOfferSection = function () {
        var childModel = viewModelFactory("updateOffers"),
			id = self.Header.ApplicationID.itemValue(),
			name = self.Header.PrimaryApplicant.itemValue();
        processUpdateOffer.call(childModel, id, name, item);
    };
    self.bindPdfLink = function () {
        var document = {
            ApplicationID: self.Header.ApplicationID.itemValue()
        },
        urlAssigned = "api/download/packet?";
        window.location.href = urlAssigned + $.param(document);
    };
    self.loadRehashData = function (id) {
        var childModel = viewModelFactory();
        processRehashCalculator.call(childModel, id, item, "leads");
    };
    self.bindRehashSection = function () {
        if (isRehashDisplayed == false) {
            self.loadRehashData($('#appId').val());
            $("#showRehashBtn").html('<i class="icon-file"></i> Show Deal Info');
            $('#leadDetails').hide();
            $('#showRehashBtn').removeClass('btn-primary');
            $('#rehash-calculator').show();
            hideSidebar();
            $('.show-deck').hide();
            $('.hide-deck').hide();
            $("#headerPrimaryNavigation").hide();
            $("#vendorDetails").hide();
            $("#headerSecondaryNavigation").hide();
            $("#footerNavigation").hide();
            $("#adminBar").hide();
            $("#logoSection a").on("click", function () { event.preventDefault(); });
            isRehashDisplayed = true;
        } else {
            $("#modal-warning").modal('show');
        }
    };
    self.runUtilities = function () {
        var existingDropdown = self.LeadDealerInformation.DealerLeadStatus.itemValue(),
			existingdatetime = self.LeadDealerInformation.CustomerAppointment.itemValue(),
			existingdate = DE.utilities.formatHandler(existingdatetime, { format: "dateOnly" }),
			existingtime = DE.utilities.formatHandler(existingdatetime, { format: "time" }),
			appStatus = self.ApplicantInformation.Status.itemValue(),
            isPrequalificationApp = item.isPrequalificationApp(),
            applicationStatus = item.status();

        self.isVehicleNotAvailable(self.DesiredVehicleInformation.Year.itemValue() === 0 && _.isNull(self.DesiredVehicleInformation.Model.itemValue()) && _.isNull(self.DesiredVehicleInformation.Trim.itemValue()));

        if (existingDropdown === 0) {
            $("#leadsDropDown").val("");
        }
        else {
            $("#leadsDropDown").val(existingDropdown);
        }
        $("#existingAppointmentDate").html("");
        $("#existingAppointmentTime").html("");

        if (existingdate !== "NA" || existingtime !== "NA") {
            $("#existingAppointmentDate").html(existingdate);
            $("#existingAppointmentTime").html(existingtime);
        }
        else {
            $("#existingAppointmentDate").html("No appointment exists.");
        }
        if (appStatus === "Declined" || appStatus === "Approved Expired" || appStatus === "Rejected") {
            self.isDeclinedVisible(false);
        }
        if (isPrequalificationApp === "True") {
            self.isPrequalVisible(false);
        }
        if (applicationStatus === "Approved" || applicationStatus === "Conditioned") {
            self.isFullCreditAppVisible(true);
        }
    };
    self.runUtilities();
};

var LeadsSetAppointmentViewModel = function (item) {
    var self = this;
    self.applicationId = ko.observable(item.appId());
    self.applicantName = ko.observable(item.name());
    self.selectedAppointmentDate = ko.observable("").extend({ required: true });
    self.selectedAppointmentTime = ko.observable("").extend({ required: true });
    self.errors = ko.validation.group(self);
    self.currentAppointmentDateTime = ko.computed(function () {
        return self.selectedAppointmentDate() + " " + self.selectedAppointmentTime();
    });
    self.feedback = {
        text: ko.observable(),
        isVisible: ko.observable(false),
        feedbackClass: ko.observable()
    };

    self.onLoad = function () {
        if (self.feedback.text() !== "") {
            self.feedback.text("");
            self.feedback.isVisible(false);
            self.feedback.feedbackClass("");
            self.errors.showAllMessages(false);
        }
    };
    self.onSuccess = function () {
        self.feedback.isVisible(true);
        self.feedback.feedbackClass("text-success");
        self.feedback.text("Your appointment has been set successfully.");
        self.resetForm();
    };
    self.onFailure = function () {
        self.feedback.isVisible(true);
        self.feedback.feedbackClass("text-error");
        self.feedback.text("We are sorry. The appointment HAS NOT been set due to some error. Please try again later.");
    };
    self.setAppointment = function () {
        if (_.isEmpty(self.errors())) {
            var appointment = {
                "DealerID": __slideDeckItems.vendorId(),
                "ApplicationID": item.appId(),
                "AppointmentTime": self.currentAppointmentDateTime()
            };
            $("#existingAppointmentDate").html(self.selectedAppointmentDate());
            $("#existingAppointmentTime").html(self.selectedAppointmentTime());
            DE.proxy.postAppointmentTime(ko.toJSON(appointment), self.onSuccess, self.onFailure);
        }
        else {
            self.errors.showAllMessages();
        }
    };
    self.resetForm = function () {
        self.errors.showAllMessages(false);
    };
    self.cancel = function () {
        self.resetForm();
        self.onLoad();
        $('#set-appointment-modal').modal('hide');
    };
    $('#set-appointment-modal').on('hidden', function () {
        self.cancel();
    });
};

var offerMap = {
    1: {
        Description: "Lowest Down",
        Sequence: 1
    },
    2: {
        Description: "Basic",
        Sequence: 0
    },
    3: {
        Description: "Lowest APR",
        Sequence: 2
    }
};

var processUpdateOffer = function (id, name, item) {
    var self = this;

    self.applicationId = ko.observable(id);
    self.applicantName = ko.observable(name);
    self.selectedRecommendationId = ko.observable();
    self.feedback = {
        text: ko.observable(),
        isVisible: ko.observable(false),
        feedbackClass: ko.observable()
    };
    self.offers = ko.observableArray([]);

    self.onSuccess = function (response) {
        $.each(response, function () {
            this.Description = offerMap[this.OfferType].Description;
            this.Sequence = offerMap[this.OfferType].Sequence;
            if (this.IsOfferSelected === true) {
                self.selectedRecommendationId(this.RecommendationID);
            };
        });
        self.loadData(response);
    };
	self.setOffer = function (data, event) {
        var target = (event.currentTarget) ? event.currentTarget : event.srcElement;
        clickedOffer = offerMap[target.getAttribute('data-offerType')].Sequence;
        self.selectedRecommendationId(data.offers()[clickedOffer].RecommendationID);
        $('#updateOfferBody tr').eq(clickedOffer).addClass('selectedOffer').siblings('tr').removeClass('selectedOffer');
    };
	DE.proxy.getOffer(id, self.onSuccess);

    self.loadData = function (data) {
        self.offers = self.toObservableArray(data);
        ko.applyBindings(this, document.getElementById("updateOffers"));
        $("#update-offer-modal").modal('show');
    };
	self.onOfferSaveSuccess = function () {
        $('#update-offer-modal').modal('hide');
        slideDeckItemClickHandler(item, "leads", __slideDeckItems.vendorId());
        return false;
    };
	self.onFailure = function () {
        self.feedback.isVisible(true);
        self.feedback.feedbackClass("text-error");
        self.feedback.text("We are sorry. The offer update CAN NOT complete due to some error. Please try again later.");
    };
	self.saveUpdateOffer = function () {
        var offerToBeSaved = {
            ApplicationID: self.applicationId(),
            RecommendationID: self.selectedRecommendationId()
        };
		DE.proxy.postOffer(ko.toJSON(offerToBeSaved), self.onOfferSaveSuccess, self.onFailure);
    };
	self.cancel = function () {
        if (self.feedback.text() !== "") {
            self.feedback.text("");
            self.feedback.isVisible(false);
            self.feedback.feedbackClass("");
        }
        $('#update-offer-modal').modal('hide');
    };
	$('#update-offer-modal').on('hidden', function () {
        self.cancel();
    });
};

var viewModelFactory = function (callerPage, data) {
    var viewModel = new ObservableObjectViewModel();
    if (callerPage == "Funding") {
        viewModel.dataAttributes = DE.lookups.formattedData.funding;
        if (data.Structure.IsLease) {
            viewModel.dynamicFields = DE.lookups.dynamic.funding_lease;
        }
        else {
            viewModel.dynamicFields = DE.lookups.dynamic.funding_normal;
        }
        viewModel.applicationVerificationStyleMap = DE.lookups.styleMap.fundingApplicationVerification;
    }
    if (callerPage == "lastApproval") {
        viewModel.dataAttributes = DE.lookups.formattedData.lastApproval;
        viewModel.dynamicFields = DE.lookups.dynamic.lastApproval;
    }
    if (callerPage == "Applications") {
        viewModel.dataAttributes = DE.lookups.formattedData.application;
        viewModel.dynamicFields = DE.lookups.dynamic.application;
    }
    if (callerPage == "Leads") {
        viewModel.dataAttributes = DE.lookups.formattedData.leads;
        viewModel.dynamicFields = DE.lookups.dynamic.leads;
    }
    if (callerPage == "updateOffers") {
        viewModel.dataAttributes = DE.lookups.formattedData.updateOffer;
    }
    return viewModel;
};

var slideDeckItemAttributes = {
    "Funding": {
        handler: processFundingDetail,
        formFlag: true,
        formCtor: [
        	ContactFunderFormViewModel,
        	FundingUploadImageViewModel
			],
        formElement: [
			"contact-funder-modal",
			"upload-modal"
			],
        clickBindings: [
			'#show-last-approval',
			'#show-purchase-letter',
			'#upload-docs',
            "#viewAdjustedFeeBtn",
            "#showCommentsBtn",
			'#contact-funder-footer .btn'
			],
        bindingPage: "applicationDetails",
        validationElement: "#contact-funder .validationMessage"
    },
    "Applications": {
        handler: processApplicationDetail,
        formFlag: true,
        formCtor: ContactAnalystFormViewModel,
        formElement: "contact-analyst-modal",
        clickBindings: [
			"#show-rehash-calculator",
			"#contactAnalystButtton",
			"#copyAllBtn",
			"#rehashSubmitBtn",
			"#rehashModalCancelBtn",
			"#rehashModalFinalizeBtn",
            "#rehashSubmitBtnTop",
            "#rehashSubmitBtnBottom",
            "#copyAllTop",
            "#copyAllBottom",
            "#resetTop",
            "#resetBottom",
			"#contact-analyst-footer .btn"
			],
        bindingPage: "applicationDetails",
        validationElement: "#contact-analyst .validationMessage"
    },
    "Leads": {
        handler: processLeadDetail,
        formFlag: true,
        formCtor: [
			LeadsSaveStatusViewModel,
			LeadsSetAppointmentViewModel
			],
        formElement: [
			"saveStatusButton",
			"setAppointment"
			],
        clickBindings: [
			"#contactAnalystButtton",
			"#saveStatusButton",
			"#updateOfferBtn",
			"#saveUpdateOffer",
			'#pdfPacketBtn',
            "#showRehashBtn",
			"#contact-analyst-footer .btn",
			"#set-appointment-modal .btn, #set-appointment-modal .close"
			],
        bindingPage: "applicationDetails",
        validationElement: "#setAppointment .validationMessage"
    }
};

var slideDeckItemClickHandler = function (item, module, vendorId) {
    var self = this,
		page = item.description(),
        appId = item.appId(),
        isPrequalificationApp = _.has(item, 'isPrequalificationApp') ? item.isPrequalificationApp() : undefined,
   		attribute = slideDeckItemAttributes[page];

    self.loadPageData = function (response) {
        var data = response,
            isDataFromServerEmpty = DE.utilities.checkEmptyNullServerResponse(data),
            viewModel = viewModelFactory(page, data);

        if (isDataFromServerEmpty) {
            if (attribute.formFlag) {
                if (_.isArray(attribute.formCtor)) {
                    var __contactFormData = [];
                    $.each(attribute.formCtor, function () {
                        __contactFormData.push(new this(item));
                    });
                }
                else {
                    __contactFormData = new attribute.formCtor(item);
                }
            }

            attribute.handler.call(viewModel, data, item);

            _.each(attribute.clickBindings, function (el) {
                $(el).off('click');
            });
            $(attribute.validationElement).remove();

            ko.applyBindings(viewModel, document.getElementById(attribute.bindingPage));
            if (attribute.formFlag) {
                if (_.isArray(__contactFormData) && _.isArray(attribute.formElement)) {
                    for (var i = 0; i <= (__contactFormData.length - 1); i++) {
                        ko.applyBindings(__contactFormData[i], document.getElementById(attribute.formElement[i]));
                    }
                }
                else {
                    ko.applyBindings(__contactFormData, document.getElementById(attribute.formElement));
                }
            }
            $("#serverSuccessData").show();
            $("#serverErrorData").hide();
        }
        else {
            $("#serverSuccessData").hide();
            $("#serverErrorData").show().css({ 'text-align': 'center', 'margin': '60px 0', 'font-weight': 'bold' });
        }
        applySiteSettings(DE.lookups.siteSettingsParams);
    };
    self.isWebRoleHyundai = function () {
        var webRoleId = DE.utilities.readCookie("WebRoleID");
        if (webRoleId != null && (webRoleId == "41" || webRoleId == "42")) {
            $("#printPage").hide();
        }
    };
    self.isWebRoleHyundai();

    DE.proxy.getSlideDeckItemDetail(module, appId, vendorId, self.loadPageData, isPrequalificationApp);
};

var SubmitNewApplicationViewModel = function () {
    var self = this,
        vehicleConditionFromServer = [],
        vehicleDataFromVin = {},
        tradeVehicleDataFromVin = {},
        trackProcess = new DE.utilities.TimeTracker({
            enable: true,
            seconds: 10,
            onUpdateStatus: function (sec) {
                $("#processingTime").html(sec);
            },
            onCounterEnd: function () {
                $("#inProcess").hide();
                $("#appSubmitContinue").show();
            }
        });

    self.isBalloonEnabled = ko.observable(false);
    self.isPreApplySectionVisible = ko.observable(true);
    self.isAdditionalPreApplySectionVisible = ko.observable(false);
    self.isApplicantCreditInfoSectionVisible = ko.observable(false);
    self.isPersonalApplicant = ko.observable(true);
    self.isCoApplicantCreditInfoSectionVisible = ko.observable(false);
    self.isFinancialInfoSectionVisible = ko.observable(false);
    self.isLegalAcknowledgementSectionVisible = ko.observable(false);
    self.isTradeInSectionVisible = ko.observable(false);
    self.isNextStepButtonVisible = ko.observable(true);
    self.isResetAppFormButtonVisible = ko.observable(false);
    self.newForm_applicantDriversLicense_visible = ko.observable(false);
    self.newForm_applicantPOBoxRuralRoute_visible = ko.observable(false);
    self.newForm_applicantTimeAtAddress_visible = ko.observable(false);
    self.newForm_applicantHousing_visible = ko.observable(false);
    self.newForm_applicantEmploymentStatus_visible = ko.observable(false);
    self.newForm_applicantBusinessPhone_visible = ko.observable(false);
    self.newForm_applicantTimeAtEmployer_visible = ko.observable(false);
    self.newForm_applicantOccupation_visible = ko.observable(false);
    self.newForm_coApplicantDriversLicense_visible = ko.observable(false);
    self.newForm_coApplicantPOBoxRuralRoute_visible = ko.observable(false);
    self.newForm_coApplicantTimeAtAddress_visible = ko.observable(false);
    self.newForm_coApplicantHousing_visible = ko.observable(false);
    self.newForm_coAapplicantEmploymentStatus_visible = ko.observable(false);
    self.newForm_coApplicantBusinessPhone_visible = ko.observable(false);
    self.newForm_coApplicantTimeAtEmployer_visible = ko.observable(false);
    self.newForm_coApplicantOccupation_visible = ko.observable(false);
    self.newForm_vehicleValuationSource_visible = ko.observable(false);
    self.newForm_RegulationB_visible = ko.observable(false);
    self.newForm_NetTrade_visible = ko.observable(false);

    self.selectedCallType = ko.observable("paymentCall");
    self.selectedApplicationType = ko.observable("1");
    self.applicationTypeFromServer = ko.observableArray([]);
    self.vendorName = ko.observable();
    self.programTypeName = ko.observable();
    self.vinValidated = ko.observable(false);
    self.tradeInVinValidated = ko.observable(false);
    self.trimFromVinExists = ko.observable(false);
    self.trimFromTradeVinExists = ko.observable(false);

    self.newForm_ProgramType = ko.observable().extend({ required: false });

    self.isProgramTypeChrysler = ko.computed(function () {
        return self.newForm_ProgramType() === "16384";
    });
    self.newForm_ProductType = ko.observable().extend({
        conditional_required: function () { return self.isProgramTypeChrysler(); }
    });

    self.isProductTypeLease = ko.computed(function () {
        if (self.newForm_ProductType() === "1") {
            self.selectedCallType("paymentCall");
            return false;
        }
        else {
            if (self.newForm_ProductType() === "2") {
                self.selectedCallType("structureCall");
                return true;
            }
        }
    });

    self.isProductTypeBalloon = ko.computed(function () {
        return (self.newForm_ProductType() === "3");
    });

    self.newForm_applicantFirstName = ko.observable().extend({
        conditional_required: function () { return self.isApplicantCreditInfoSectionVisible() && self.isPersonalApplicant(); },
        minLength: 2,
        pattern: {
            message: 'Only alphabets allowed',
            params: '^[A-Za-z0-9\s]+$'
        }
    });
    self.newForm_applicantMiddleInitial = ko.observable().extend({
        pattern: {
            message: 'Only alphabets allowed',
            params: '^[A-Za-z0-9]+$'
        }
    });
    self.newForm_applicantLastName = ko.observable().extend({
        conditional_required: function () { return self.isApplicantCreditInfoSectionVisible() && self.isPersonalApplicant(); },
        minLength: 2,
        pattern: {
            message: 'Only alphabets allowed',
            params: '^[A-Za-z0-9\s]+$'
        }
    });
    self.newForm_applicantSuffix = ko.observable();
    self.newForm_applicantEmailAddress = ko.observable().extend({ email: true });
    self.newForm_applicantSSN = ko.observable().extend({
        conditional_required: function () { return self.isApplicantCreditInfoSectionVisible() && self.isPersonalApplicant(); }
    });
    self.newForm_applicantDriversLicenseNumber = ko.observable().extend({
        pattern: {
            message: 'Only alphanumeric characters allowed',
            params: '^[A-Za-z0-9]+$'
        }
    });
    self.newForm_applicantDriversLicenseState = ko.observable().extend({
        pattern: {
            message: 'Only alphabets allowed',
            params: '^[A-Za-z]+$'
        }
    });
    self.newForm_applicantAddress = ko.observable().extend({
        required: true,
        minLength: 3,
        pattern: {
            message: 'Only alphanumeric or special characters (@ # * , . - _) allowed',
            params: /^[\w\s\@*#\-_\(\),\.]+/
        }
    });
    self.newForm_applicantPOBox = ko.observable();
    self.newForm_applicantRuralRoute = ko.observable().extend({ number: true });
    self.newForm_applicantCity = ko.observable().extend({
        required: true,
        minLength: 2,
        pattern: {
            message: 'Only alphanumeric characters allowed',
            params: /^[\w]+(?:[\s-][\w]+)*$/
        }
    });
    self.newForm_applicantState = ko.observable().extend({
        required: true,
        pattern: {
            message: 'Only alphabets allowed',
            params: /^[\w]+(?:[\s-][\w]+)*$/
        }
    });
    self.newForm_applicantDateOfBirth = ko.observable().extend({
        conditional_required: function () { return self.isApplicantCreditInfoSectionVisible() && self.isPersonalApplicant(); },
        no_future_date: true,
        minimum_age_state_based: function () { return DE.lookups.stateAgeConfig[self.newForm_applicantState()]; },
        date: true
    });
    self.newForm_applicantZip = ko.observable().extend({ required: true, minLength: 5, number: true });
    self.newForm_applicantHomePhone = ko.observable().extend({
        conditional_required: function () { return self.isApplicantCreditInfoSectionVisible() && self.isPersonalApplicant(); }
    });
    self.newForm_applicantMobilePhone = ko.observable();
    self.newForm_applicantTimeAtAddressYears = ko.observable().extend({ number: true });
    self.newForm_applicantTimeAtAddressMonths = ko.observable().extend({ number: true });
    self.newForm_applicantHousingStatus = ko.observable();
    self.newForm_applicantMortgageRentPayment = ko.observable(0);
    self.newForm_applicantEmploymentStatus = ko.observable();
    self.newForm_applicantEmployedBy = ko.observable();
    self.newForm_applicantBusinessPhone = ko.observable();
    self.newForm_applicantTimeAtEmployerYears = ko.observable().extend({ number: true });
    self.newForm_applicantTimeAtEmployerMonths = ko.observable().extend({ number: true });
    self.newForm_applicantOccupation = ko.observable();
    self.newForm_applicantGrossMonthlyIncome = ko.observable(0).extend({
        non_zero_number: function () { return self.isApplicantCreditInfoSectionVisible() && self.isPersonalApplicant(); },
        conditional_required: function () { return self.isApplicantCreditInfoSectionVisible() && self.isPersonalApplicant(); }
    });
    self.newForm_applicantOtherMonthlyIncome = ko.observable(0);
    self.newForm_applicantSourceOtherMonthlyIncome = ko.observable();

    self.newForm_TaxId = ko.observable().extend({
        conditional_required: function () { return self.isPersonalApplicant() === false; }
    });
    self.newForm_LegalBusinessName = ko.observable().extend({
        conditional_required: function () { return self.isPersonalApplicant() === false; },
        minLength: 3
    });
    self.newForm_BusinessApplicantPhone = ko.observable().extend({
        conditional_required: function () { return self.isPersonalApplicant() === false; }
    });

    self.newForm_coApplicantFirstName = ko.observable().extend({
        conditional_required: function () { return self.isCoApplicantCreditInfoSectionVisible(); },
        minLength: 2,
        pattern: {
            message: 'Only alphabets allowed',
            params: '^[A-Za-z0-9\s]+$'
        }
    });
    self.newForm_coApplicantMiddleInitial = ko.observable().extend({
        pattern: {
            message: 'Only alphabets allowed',
            params: '^[A-Za-z0-9]+$'
        }
    });
    self.newForm_coApplicantLastName = ko.observable().extend({
        conditional_required: function () { return self.isCoApplicantCreditInfoSectionVisible(); },
        minLength: 2,
        pattern: {
            message: 'Only alphabets allowed',
            params: '^[A-Za-z0-9\s]+$'
        }
    });
    self.newForm_coApplicantSuffix = ko.observable();
    self.newForm_coApplicantEmailAddress = ko.observable().extend({ email: true });
    self.newForm_coApplicantSSN = ko.observable().extend({
        conditional_required: function () { return self.isCoApplicantCreditInfoSectionVisible(); }
    });
    self.newForm_coApplicantDriversLicenseNumber = ko.observable().extend({
        pattern: {
            message: 'Only alphanumeric characters allowed',
            params: '^[A-Za-z0-9]+$'
        }
    });
    self.newForm_coApplicantDriversLicenseState = ko.observable().extend({
        pattern: {
            message: 'Only alphabets allowed',
            params: '^[A-Za-z]+$'
        }
    });
    self.newForm_coApplicantAddress = ko.observable().extend({
        conditional_required: function () { return self.isCoApplicantCreditInfoSectionVisible(); },
        minLength: 3,
        pattern: {
            message: 'Only alphanumeric or special characters (@ # * , . - _) allowed',
            params: /^[\w\s\@*#\-_\(\),\.]+/
        }
    });
    self.newForm_coApplicantPOBox = ko.observable();
    self.newForm_coApplicantRuralRoute = ko.observable();
    self.newForm_coApplicantCity = ko.observable().extend({
        conditional_required: function () { return self.isCoApplicantCreditInfoSectionVisible(); },
        minLength: 2,
        pattern: {
            message: 'Only alphanumeric characters allowed',
            params: /^[\w]+(?:[\s-][\w]+)*$/
        }
    });
    self.newForm_coApplicantState = ko.observable().extend({
        conditional_required: function () { return self.isCoApplicantCreditInfoSectionVisible(); },
        pattern: {
            message: 'Only alphabets allowed',
            params: /^[\w]+(?:[\s-][\w]+)*$/
        }
    });
    self.newForm_coApplicantZip = ko.observable().extend({
        conditional_required: function () { return self.isCoApplicantCreditInfoSectionVisible(); },
        minLength: 5,
        number: true
    });
    self.newForm_coApplicantDateOfBirth = ko.observable().extend({
        conditional_required: function () { return self.isCoApplicantCreditInfoSectionVisible(); },
        no_future_date: true,
        minimum_age_state_based: function () { return DE.lookups.stateAgeConfig[self.newForm_coApplicantState()]; },
        date: true
    });
    self.newForm_coApplicantHomePhone = ko.observable().extend({
        conditional_required: function () { return self.isCoApplicantCreditInfoSectionVisible(); }
    });
    self.newForm_coApplicantMobilePhone = ko.observable();
    self.newForm_coApplicantTimeAtAddressYears = ko.observable().extend({ number: true });
    self.newForm_coApplicantTimeAtAddressMonths = ko.observable().extend({ number: true });
    self.newForm_coApplicantHousingStatus = ko.observable();
    self.newForm_coApplicantMortgageRentPayment = ko.observable(0);
    self.newForm_coApplicantEmploymentStatus = ko.observable();
    self.newForm_coApplicantEmployedBy = ko.observable();
    self.newForm_coApplicantBusinessPhone = ko.observable();
    self.newForm_coApplicantTimeAtEmployerYears = ko.observable().extend({ number: true });
    self.newForm_coApplicantTimeAtEmployerMonths = ko.observable().extend({ number: true });
    self.newForm_coApplicantOccupation = ko.observable();
    self.newForm_coApplicantGrossMonthlyIncome = ko.observable(0).extend({
        non_zero_number: function () { return self.isCoApplicantCreditInfoSectionVisible(); },
        conditional_required: function () { return self.isCoApplicantCreditInfoSectionVisible(); }
    });
    self.newForm_coApplicantOtherMonthlyIncome = ko.observable(0);
    self.newForm_coApplicantSourceOtherMonthlyIncome = ko.observable();
    self.newForm_vehicleStockNumber = ko.observable();
    self.newForm_vehicleModel = ko.observable().extend({
        conditional_required: function () { return self.isFinancialInfoSectionVisible(); }
    });
    self.newForm_vehicleTrim = ko.observable();
    self.newForm_vehicleYear = ko.observable().extend({
        conditional_required: function () { return self.isFinancialInfoSectionVisible(); }
    });
    self.newForm_vehicleMake = ko.observable().extend({
        conditional_required: function () { return self.isFinancialInfoSectionVisible(); }
    });
    self.newForm_vehicleInvoiceValue = ko.observable(0).extend({
        non_zero_number: function () { return self.isFinancialInfoSectionVisible(); },
        conditional_required: function () { return self.isFinancialInfoSectionVisible(); }
    });
    self.newForm_vehicleMSRP = ko.observable(0).extend({
        non_zero_number: function () { return self.isFinancialInfoSectionVisible() && (self.isProductTypeLease() || self.isProductTypeBalloon()); },
        conditional_required: function () { return self.isFinancialInfoSectionVisible() && (self.isProductTypeLease() || self.isProductTypeBalloon()); }
    });
    self.newForm_vehicleValuationSource = ko.observable();
    self.newForm_vehicleOdometerMileage = ko.observable().extend({
        number: true,
        conditional_required: function () { return self.isFinancialInfoSectionVisible(); }
    });
    self.newForm_vehicleCondition = ko.observable().extend({
        conditional_required: function () { return self.selectedCallType() === "structureCall"; }
    });
    self.newForm_vehicleLienHolder = ko.observable();
    self.newForm_vehicleMonthlyPayment = ko.observable(0);
    self.newForm_IsTradeIn = ko.observable("false");
    self.newForm_tradeVehicleStockNumber = ko.observable();
    self.newForm_tradeVehicleModel = ko.observable().extend({
        conditional_required: function () { return self.newForm_IsTradeIn() === "true"; }
    });
    self.newForm_tradeVehicleTrim = ko.observable();
    self.newForm_tradeVehicleYear = ko.observable().extend({
        conditional_required: function () { return self.newForm_IsTradeIn() === "true"; }
    });
    self.newForm_tradeVehicleMake = ko.observable().extend({
        conditional_required: function () { return self.newForm_IsTradeIn() === "true"; }
    });
    self.newForm_tradeVehicleInvoiceValue = ko.observable(0).extend({
        conditional_required: function () { return self.newForm_IsTradeIn() === "true"; }
    });
    self.newForm_tradeVehicleMSRP = ko.observable(0).extend({
        conditional_required: function () { return self.newForm_IsTradeIn() === "true"; }
    });

    self.newForm_tradeVehicleValuationSource = ko.observable();
    self.newForm_tradeVehicleOdometerMileage = ko.observable(0).extend({
        conditional_required: function () { return self.newForm_IsTradeIn() === "true"; }
    });
    self.newForm_tradeVehicleCondition = ko.observable();
    self.newForm_tradeVehicleLienHolder = ko.observable();
    self.newForm_tradeVehicleMonthlyPayment = ko.observable(0);
    self.newForm_ApplicationId = ko.observable();
    self.newForm_VendorId = ko.computed(function () { return DE.utilities.readCookie("DealerID"); });
    self.newForm_ApplicationType = ko.observable("32");
    self.newForm_IsPaymentCall = ko.observable().extend({ conditional_required: function () { return self.selectedCallType() === "PaymentCall"; } });
    self.newForm_ApplicantRelationship = ko.observable().extend({
        conditional_required: function () { return self.isCoApplicantCreditInfoSectionVisible() && self.isPersonalApplicant(); }
    });
    self.newForm_Term = ko.observable(0).extend({
        non_zero_number: function () { return self.isFinancialInfoSectionVisible(); },
        conditional_required: function () { return self.isFinancialInfoSectionVisible(); }
    });
    self.newForm_CashPrice = ko.observable(0).extend({
        non_zero_number: function () { return self.isFinancialInfoSectionVisible(); },
        conditional_required: function () { return self.isFinancialInfoSectionVisible(); }
    });
    self.newForm_SalesTax = ko.observable(0).extend({
        non_zero_number: function () { return self.isFinancialInfoSectionVisible() && self.isProductTypeLease() === false; },
        conditional_required: function () { return self.isFinancialInfoSectionVisible(); }
    });
    self.newForm_TitleFee = ko.observable(0).extend({
        non_zero_number: function () { return self.isFinancialInfoSectionVisible() && self.isProductTypeLease() === false; },
        conditional_required: function () { return self.isFinancialInfoSectionVisible(); }
    });
    self.newForm_CashDown = ko.observable(0);
    self.newForm_FrontEndBackEndFees = ko.observable(0);
    self.newForm_CapCost = ko.observable(0);
    self.newForm_EstimatedPayment = ko.observable(0);
    self.newForm_Invoice = ko.observable(0);
    self.newForm_AcqFee = ko.observable(0);
    self.newForm_Rebate = ko.observable(0);
    self.newForm_NetTrade = ko.observable(0).extend({
        number: true,
        conditional_required: function () { return self.isFinancialInfoSectionVisible(); }
    });

    self.newForm_AnnualMileage = ko.observable().extend({
        conditional_required: function () { return self.isFinancialInfoSectionVisible() && self.isProductTypeLease(); }
    });
    self.newForm_CapCost = ko.computed(function () {
        return (parseFloat(self.newForm_CashPrice()) -
				parseFloat(self.newForm_CashDown()) -
				parseFloat(self.newForm_Rebate()) +
                parseFloat(self.newForm_AcqFee()) +
				parseFloat(self.newForm_NetTrade()));
    });
    self.newForm_UnpaidBalance = ko.computed(function () {
        return (parseFloat(self.newForm_CashPrice()) +
				parseFloat(self.newForm_SalesTax()) +
				parseFloat(self.newForm_TitleFee()) -
				parseFloat(self.newForm_CashDown()) +
				parseFloat(self.newForm_FrontEndBackEndFees()) -
				parseFloat(self.newForm_Rebate()) +
				parseFloat(self.newForm_NetTrade()));
    });
    self.newForm_Insurance = ko.observable(0);
    self.newForm_Gap = ko.observable(0);
    self.newForm_Warranty = ko.observable(0);
    self.newForm_EstAmountFinanced = ko.computed(function () {
        return (parseFloat(self.newForm_UnpaidBalance()) +
				parseFloat(self.newForm_Insurance()) +
				parseFloat(self.newForm_Gap()) +
				parseFloat(self.newForm_Warranty()));
    });
    self.newForm_AdditionalComments = ko.observable();
    self.newForm_DisclosureStatementAgree = ko.observable().extend({ equal: {
        message: "Please check this box",
        params: true
    }
    });
    self.newForm_RegulationB = ko.observable().extend({
        conditional_required_checkbox: function () { return self.newForm_RegulationB_visible(); }
    });
    self.newForm_SignedPaperApplication = ko.observable().extend({ equal: {
        message: "Please check this box",
        params: true
    }
    });
    self.newForm_CopyOfPrivacyNotice = ko.observable().extend({ equal: {
        message: "Please check this box",
        params: true
    }
    });
    self.newForm_MetaData = ko.observable();
    self.newForm_SourceIPAddress = ko.observable();

    self.programType = ko.observableArray([]);
    self.productType = ko.observableArray([]);
    self.annualMileage = ko.observableArray([]);

    self.suffix = ko.observableArray([]);
    self.employmentStatus = ko.observableArray([]);
    self.housingStatus = ko.observableArray([]);
    self.relationshipStatus = ko.observableArray([]);
    self.vehicleCondition = ko.observableArray([]);
    self.vehicleYear = ko.observableArray([]);
    self.vehicleMake = ko.observableArray([]);
    self.vehicleModel = ko.observableArray([]);
    self.vehicleTrim = ko.observableArray([]);
    self.tradeInVehicleYear = ko.observableArray([]);
    self.tradeInVehicleMake = ko.observableArray([]);
    self.tradeInVehicleModel = ko.observableArray([]);
    self.tradeInVehicleTrim = ko.observableArray([]);
    self.tradeInVehicleValuationSource = ko.observableArray([]);
    self.vehicleValuationSource = ko.observableArray([]);
    self.legalDisclaimers = ko.observableArray([]);

    self.vinServerValidSuccess = function (response, type) {
        if (response.IsValidVin) {
            $.each(response, function (key, val) {
                if (typeof val === "string") {
                    val = val.toUpperCase();
                    response[key] = val;
                }
            });
            if (type === "primary") {
                vehicleDataFromVin = response;
                self.vinValidated(true);
                self.newForm_vehicleYear(response.Year);
                self.newForm_vehicleMake(response.Make);
                self.newForm_vehicleModel(response.Model);
                self.trimFromVinExists(_.isEmpty(_.findWhere(self.vehicleTrim(), { id: response.Trim })) === false);
                if (self.trimFromVinExists()) self.newForm_vehicleTrim(response.Trim);
            }
            if (type === "tradeIn") {
                tradeVehicleDataFromVin = response;
                self.tradeInVinValidated(true);
                self.newForm_tradeVehicleYear(response.Year);
                self.newForm_tradeVehicleMake(response.Make);
                self.newForm_tradeVehicleModel(response.Model);
                self.trimFromTradeVinExists(_.isEmpty(_.findWhere(self.tradeVehicleTrim(), { id: response.Trim })) === false);
                if (self.trimFromTradeVinExists()) self.newForm_tradeVehicleTrim(response.Trim);
            }
            vehicleDataFromVin = {};
            tradeVehicleDataFromVin = {};
        }
        else self.vinSimpleValidFail();
    };
	self.vinSimpleValidFail = function (type) {
        if (type === "primary") {
            self.vinValidated(false);
            self.newForm_vehicleYear(undefined);
        }
        if (type === "tradeIn") {
            self.tradeInVinValidated(false);
            self.newForm_tradeVehicleYear(undefined);
        }
    };
	self.newForm_vehicleVIN = ko.observable().extend({
        validate_vin: {
            vinType: "primary",
            vehicleCondition: self.newForm_vehicleCondition,
            simpleInvalidCallback: self.vinSimpleValidFail,
            serverValidCallback: self.vinServerValidSuccess
        }
    });

    self.newForm_tradeVehicleVIN = ko.observable().extend({
        validate_vin: {
            vinType: "tradeIn",
            vehicleCondition: self.newForm_vehicleCondition,
            simpleInvalidCallback: self.vinSimpleValidFail,
            serverValidCallback: self.vinServerValidSuccess
        }
    });

    self.errors = ko.validation.group(self);

    self.onApplicantZipBlur = function () {
        if (_.isUndefined(self.newForm_applicantZip()) === false &&
            _.isNull(self.newForm_applicantZip()) === false &&
            _.isEmpty(self.newForm_applicantZip()) === false &&
            _.isNull(self.newForm_applicantZip.error)) {
            DE.proxy.getCityState(self.newForm_applicantZip(), self.onApplicantZipSuccess);
        }
    };
	self.onCoApplicantZipBlur = function () {
        if (_.isUndefined(self.newForm_coApplicantZip()) === false &&
            _.isNull(self.newForm_coApplicantZip()) === false &&
            _.isEmpty(self.newForm_coApplicantZip()) === false &&
            _.isNull(self.newForm_coApplicantZip.error)) {
            DE.proxy.getCityState(self.newForm_coApplicantZip(), self.onCoApplicantZipSuccess);
        }
    };
	self.nextStep = function () {
        var isStructureCall = self.selectedCallType() === "structureCall",
            isLeaseEnabled = true,
            validProgramType = _.isNull(self.newForm_ProgramType.error),
            validProductType = isLeaseEnabled ? _.isNull(self.newForm_ProductType.error) : true,
            validApplicantZip = _.isNull(self.newForm_applicantZip.error),
            validVehicleCondition = isStructureCall ? _.isNull(self.newForm_vehicleCondition.error) : true,
            validNextStep = validProgramType && validVehicleCondition && validApplicantZip && validProductType;
        if (validNextStep) {
            self.buildNextStep();
        }
        else {
            if (validProgramType === false) self.newForm_ProgramType.isModified(true);
            if (validProductType === false) self.newForm_ProductType.isModified(true);
            if (validVehicleCondition === false) self.newForm_vehicleCondition.isModified(true);
            if (validApplicantZip === false) self.newForm_applicantZip.isModified(true);
        }
    };
	self.buildNextStep = function () {
        var callType = self.selectedCallType(),
            isTradeIn = self.newForm_IsTradeIn();
        self.isLegalAcknowledgementSectionVisible(true);
        self.isApplicantCreditInfoSectionVisible(true);

        if (callType === "paymentCall") {
            self.isFinancialInfoSectionVisible(false);
            self.isTradeInSectionVisible(false);
            self.newForm_IsPaymentCall(true);
        }
        else {
            self.isFinancialInfoSectionVisible(true);
            self.newForm_applicantDriversLicense_visible(true);
            self.newForm_applicantPOBoxRuralRoute_visible(true);
            self.newForm_applicantTimeAtAddress_visible(true);
            self.newForm_applicantHousing_visible(true);
            self.newForm_applicantEmploymentStatus_visible(true);
            self.newForm_applicantBusinessPhone_visible(true);
            self.newForm_applicantTimeAtEmployer_visible(true);
            self.newForm_applicantOccupation_visible(true);
            if (self.newForm_vehicleCondition() === "2") {
                self.newForm_vehicleValuationSource_visible(true);
                DE.proxy.getValuationSource(self.onValuationSourceSuccess);
            }
            if (isTradeIn === "false") {
                self.isTradeInSectionVisible(false);
            }
            else {
                self.isTradeInSectionVisible(true);
                self.newForm_NetTrade_visible(true);
                DE.proxy.getVehicleYear("used", self.onTradeInYearSuccess);
            }
        }
        self.isNextStepButtonVisible(false);
        self.isResetAppFormButtonVisible(true);
        self.isPreApplySectionVisible(false);
        DE.proxy.getHousingStatus(self.onHousingStatusSuccess);
		DE.proxy.getEmploymentStatus(self.onEmploymentStatusSuccess);
        DE.proxy.getSuffix(self.onSuffixSuccess);
        DE.proxy.getVendorName(self.newForm_VendorId(), self.onVendorNameSuccess);
    };
	$('#coApplicant').on('shown', function () {
        self.newForm_ApplicationType("64");
        self.isCoApplicantCreditInfoSectionVisible(true);
        self.newForm_RegulationB_visible(true);
        if (self.isPersonalApplicant()) {
            DE.proxy.getRelationshipStatus(self.onRelationshipStatusSuccess);
        }
        if (self.selectedCallType() === "structureCall") {
            self.newForm_coApplicantDriversLicense_visible(true);
            self.newForm_coApplicantPOBoxRuralRoute_visible(true);
            self.newForm_coApplicantTimeAtAddress_visible(true);
            self.newForm_coApplicantHousing_visible(true);
            self.newForm_coAapplicantEmploymentStatus_visible(true);
            self.newForm_coApplicantBusinessPhone_visible(true);
            self.newForm_coApplicantTimeAtEmployer_visible(true);
            self.newForm_coApplicantOccupation_visible(true);
        }
    }).on('hidden', function () {
        self.newForm_ApplicationType("32");
        self.isCoApplicantCreditInfoSectionVisible(false);
        self.newForm_RegulationB_visible(false);
        self.newForm_coApplicantFirstName(undefined);
        self.newForm_coApplicantMiddleInitial(undefined);
        self.newForm_coApplicantLastName(undefined);
        self.newForm_coApplicantSuffix(undefined);
        self.newForm_coApplicantEmailAddress(undefined);
        self.newForm_coApplicantSSN(undefined);
        self.newForm_coApplicantDateOfBirth(undefined);
        self.newForm_coApplicantDriversLicenseNumber(undefined);
        self.newForm_coApplicantDriversLicenseState(undefined);
        self.newForm_coApplicantAddress(undefined);
        self.newForm_coApplicantPOBox(undefined);
        self.newForm_coApplicantRuralRoute(undefined);
        self.newForm_coApplicantCity(undefined);
        self.newForm_coApplicantState(undefined);
        self.newForm_coApplicantZip(undefined);
        self.newForm_coApplicantHomePhone(undefined);
        self.newForm_coApplicantMobilePhone(undefined);
        self.newForm_coApplicantTimeAtAddressYears(undefined);
        self.newForm_coApplicantTimeAtAddressMonths(undefined);
        self.newForm_coApplicantHousingStatus(undefined);
        self.newForm_coApplicantMortgageRentPayment(undefined);
        self.newForm_coApplicantEmploymentStatus(undefined);
        self.newForm_coApplicantEmployedBy(undefined);
        self.newForm_coApplicantBusinessPhone(undefined);
        self.newForm_coApplicantTimeAtEmployerYears(undefined);
        self.newForm_coApplicantTimeAtEmployerMonths(undefined);
        self.newForm_coApplicantOccupation(undefined);
        self.newForm_coApplicantGrossMonthlyIncome(undefined);
        self.newForm_coApplicantOtherMonthlyIncome(undefined);
        self.newForm_coApplicantSourceOtherMonthlyIncome(undefined);
        self.newForm_RegulationB(false);
    });

    self.loadDropDown = function (arr, data) {
        var temp = [];
        if ($.isPlainObject(data) === false) {
            $.each(data, function (i, val) {
                if ($.isPlainObject(val)) {
                    temp.push({ id: val.Id, text: val.Description });
                }
                else {
                    val = val.toUpperCase();
                    temp.push({ id: val, text: val });
                }
            });
        }
        else {
            $.each(data, function (i, val) {
                val = val.toUpperCase();
                temp.push({ id: val, text: i });
            });
        }
        arr(temp);
    };
	self.onApplicantZipSuccess = function (response) {
        self.newForm_applicantCity(response.City);
        self.newForm_applicantState(response.StateAbbreviation);
    };
	self.onCoApplicantZipSuccess = function (response) {
        self.newForm_coApplicantCity(response.City);
        self.newForm_coApplicantState(response.StateAbbreviation);
    };
	self.onConditionSuccess = function (response) {
        self.loadDropDown(self.vehicleCondition, response);
    };
	self.onValuationSourceSuccess = function (response) {
        self.loadDropDown(self.vehicleValuationSource, response);
    };
	self.onRelationshipStatusSuccess = function (response) {
        self.loadDropDown(self.relationshipStatus, response);
    };
	self.onYearSuccess = function (response) {
        self.loadDropDown(self.vehicleYear, response);
    };
	self.onMakeSuccess = function (response) {
        self.loadDropDown(self.vehicleMake, response);
    };
	self.onModelSuccess = function (response) {
        self.loadDropDown(self.vehicleModel, response);
    };
	self.onTrimSuccess = function (response) {
        self.loadDropDown(self.vehicleTrim, response);
    };
	self.onTradeInYearSuccess = function (response) {
        self.loadDropDown(self.tradeInVehicleYear, response);
    };
	self.onTradeInMakeSuccess = function (response) {
        self.loadDropDown(self.tradeInVehicleMake, response);
    };
	self.onTradeInModelSuccess = function (response) {
        self.loadDropDown(self.tradeInVehicleModel, response);
    };
	self.onTradeInTrimSuccess = function (response) {
        self.loadDropDown(self.tradeInVehicleTrim, response);
    };
	self.onProgramTypeSuccess = function (response) {
        self.loadDropDown(self.programType, response);
        if (DE.utilities.readCookie("FinanceCompanyId") === "8") {
            self.newForm_ProgramType("16384");
        }
        else {
            self.newForm_ProgramType("128");
        }
        $.each(self.programType(), function (i, val) {
            if (val.id == self.newForm_ProgramType()) {
                if (val.text === "ChryslerCapital") {
                    val.text = "Chrysler Capital";
                }
                self.programTypeName(val.text);
            }
        });
    };

    self.onIsBalloonEnabledSuccess = function (response) {
        self.isBalloonEnabled(response);
    }

    self.onProductTypeSuccess = function (response) {
        if (self.isBalloonEnabled() === false) {
            response = _.omit(response, "Balloon");
        }
        self.loadDropDown(self.productType, response);
        if (DE.utilities.readCookie("FinanceCompanyId") !== "8") {
            self.newForm_ProductType("1");
        }
    };
	self.onAnnualMileageSuccess = function (response) {
        self.loadDropDown(self.annualMileage, response);
    };

   
    self.isAnnualMileageVisible = ko.computed(function () {
        return self.newForm_ProductType() === 2;
    });

    self.onHousingStatusSuccess = function (response) {
        self.loadDropDown(self.housingStatus, response);
    };
	self.onEmploymentStatusSuccess = function (response) {
        self.loadDropDown(self.employmentStatus, response);
    };
	self.onSuffixSuccess = function (response) {
        self.loadDropDown(self.suffix, response);
    };
	self.onVendorNameSuccess = function (response) {
        self.vendorName(response);
    };
	self.onNewAppSubmitSuccess = function (response) {
        $("#appSubmitContinue").hide();
        $('#modal-appSubmit-success').modal('show');
        trackProcess.start();
    };
	self.redirectToApplications = function () {
        window.location.href = "/Applications";
    };
	$('#modal-appSubmit-success').on('hidden', function () {
        self.redirectToApplications();
    });

    self.newForm_ProductType.subscribe(function (type) {
        if (type) {
            DE.proxy.getVehicleConditionByProductType(type, self.onConditionSuccess);
        }
        else {
            self.vehicleCondition([]);
        }
        self.newForm_vehicleCondition(undefined);
    });

    self.newForm_vehicleCondition.subscribe(function (condition) {
        if (condition) {
            conditionValue = _.findWhere(__submitNewApp.vehicleCondition(), { id: condition }).text;
            DE.proxy.getVehicleYear(conditionValue, self.onYearSuccess);
        }
        else {
            self.vehicleYear([]);
        }
        self.newForm_vehicleYear(undefined);
    });

    self.newForm_vehicleYear.subscribe(function (year) {
        if (year) {
            DE.proxy.getVehicleMake(year, self.onMakeSuccess);
        }
        else {
            self.vehicleMake([]);
        }
        self.newForm_vehicleMake(undefined);
    });

    self.newForm_vehicleMake.subscribe(function (make) {
        if (make) {
            var year = self.newForm_vehicleYear();
            if (year) {
                DE.proxy.getVehicleModel(year, make, self.onModelSuccess);
            }
        }
        else {
            self.vehicleModel([]);
        }
        self.newForm_vehicleModel(undefined);
    });

    self.newForm_vehicleModel.subscribe(function (model) {
        if (model) {
            var year = self.newForm_vehicleYear(),
			    make = self.newForm_vehicleMake();
            if (year && make) {
                DE.proxy.getVehicleTrim(year, make, model, self.onTrimSuccess);
            }
        }
        else {
            self.vehicleTrim([]);
        }
        self.newForm_vehicleTrim(undefined);
    });

    self.newForm_tradeVehicleYear.subscribe(function (year) {
        if (year) {
            DE.proxy.getVehicleMake(year, self.onTradeInMakeSuccess);
        }
        else {
            self.tradeInVehicleMake([]);
        }
        self.newForm_tradeVehicleMake(undefined);
    });

    self.newForm_tradeVehicleMake.subscribe(function (make) {
        if (make) {
            var year = self.newForm_tradeVehicleYear();
            if (year) {
                DE.proxy.getVehicleModel(year, make, self.onTradeInModelSuccess);
            }
        }
        else {
            self.tradeInVehicleModel([]);
        }
        self.newForm_tradeVehicleModel(undefined);
    });

    self.newForm_tradeVehicleModel.subscribe(function (model) {
        if (model) {
            var year = self.newForm_tradeVehicleYear(),
			    make = self.newForm_tradeVehicleMake();
            if (year && make) {
                DE.proxy.getVehicleTrim(year, make, model, self.onTradeInTrimSuccess);
            }
        }
        else {
            self.tradeInVehicleTrim([]);
        }
        self.newForm_tradeVehicleTrim(undefined);
    });

    self.selectedCallType.subscribe(function (value) {
        if (value === "structureCall") self.isAdditionalPreApplySectionVisible(true);
        else self.isAdditionalPreApplySectionVisible(false);
    });

    self.selectedApplicationType.subscribe(function (value) {
        if (value === "1") self.isPersonalApplicant(true);
        else self.isPersonalApplicant(false);
    });

    self.legalDisclaimers.subscribe(function (value) {
        if (_.isEmpty(value) === false) {
            self.newForm_DisclosureStatementAgree(_.contains(value, "disclosure"));
            self.newForm_SignedPaperApplication(_.contains(value, "signedPaper"));
            self.newForm_CopyOfPrivacyNotice(_.contains(value, "privacy"));
            self.newForm_RegulationB(_.contains(value, "regB"));
        }
        else {
            self.newForm_DisclosureStatementAgree(false);
            self.newForm_SignedPaperApplication(false);
            self.newForm_CopyOfPrivacyNotice(false);
            self.newForm_RegulationB(false);
        }
    });

    var numbers = [
        self.newForm_Term,
        self.newForm_vehicleMSRP,
        self.newForm_CashPrice,
        self.newForm_SalesTax,
        self.newForm_TitleFee,
        self.newForm_CashDown,
        self.newForm_FrontEndBackEndFees,
        self.newForm_Rebate,
        self.newForm_NetTrade,
        self.newForm_Insurance,
        self.newForm_Gap,
        self.newForm_Warranty,
        self.newForm_UnpaidBalance,
        self.newForm_CapCost,
        self.newForm_AcqFee,
        self.newForm_EstimatedPayment,
        self.newForm_Invoice,
        self.newForm_EstAmountFinanced,
        self.newForm_applicantMortgageRentPayment,
        self.newForm_applicantGrossMonthlyIncome,
        self.newForm_applicantOtherMonthlyIncome,
        self.newForm_coApplicantMortgageRentPayment,
        self.newForm_coApplicantGrossMonthlyIncome,
        self.newForm_coApplicantOtherMonthlyIncome,
        self.newForm_vehicleInvoiceValue,
        self.newForm_vehicleMonthlyPayment,
        self.newForm_tradeVehicleInvoiceValue,
        self.newForm_tradeVehicleOdometerMileage,
        self.newForm_tradeVehicleMonthlyPayment
    ];
    $.each(numbers, function () {
        var observable = this,
            pattern = /^[\d\-\.]+$/;
        observable.subscribe(function (value) {
            if (value === "" || _.isNaN(value) || pattern.test(value) === false) {
                return observable(0);
            }
        } .bind(self));
    });

    self.resetAppForm = function () {
        window.location.href = "/submitapp";
    };
	self.submitNewApp = function () {
        var newApplication = {
            "PrimaryApplicant":
				{
				    "FirstName": self.newForm_applicantFirstName(),
				    "MiddleInitial": self.newForm_applicantMiddleInitial(),
				    "LastName": self.newForm_applicantLastName(),
				    "Suffix": self.newForm_applicantSuffix(),
				    "EmailAddress": self.newForm_applicantEmailAddress(),
				    "SSN": _.isUndefined(self.newForm_applicantSSN()) ? undefined : self.newForm_applicantSSN().replace(/[^\d]/g, ""),
				    "DateOfBirth": self.newForm_applicantDateOfBirth(),
				    "DriversLicenseNumber": self.newForm_applicantDriversLicenseNumber(),
				    "DriversLicenseState": self.newForm_applicantDriversLicenseState(),
				    "Address": self.newForm_applicantAddress(),
				    "POBox": self.newForm_applicantPOBox(),
				    "RuralRoute": self.newForm_applicantRuralRoute(),
				    "City": self.newForm_applicantCity(),
				    "State": self.newForm_applicantState(),
				    "Zip": self.newForm_applicantZip(),
				    "HomePhone": _.isUndefined(self.newForm_applicantHomePhone()) ? undefined : self.newForm_applicantHomePhone().replace(/[^\d]/g, ""),
				    "MobilePhone": _.isUndefined(self.newForm_applicantMobilePhone()) ? undefined : self.newForm_applicantMobilePhone().replace(/[^\d]/g, ""),
				    "TimeAtAddressYears": self.newForm_applicantTimeAtAddressYears(),
				    "TimeAtAddressMonths": self.newForm_applicantTimeAtAddressMonths(),
				    "HousingStatus": self.newForm_applicantHousingStatus(),
				    "MortgageRentPayment": self.newForm_applicantMortgageRentPayment(),
				    "EmploymentStatus": self.newForm_applicantEmploymentStatus(),
				    "EmployedBy": self.newForm_applicantEmployedBy(),
				    "BusinessPhone": _.isUndefined(self.newForm_applicantBusinessPhone()) ? undefined : self.newForm_applicantBusinessPhone().replace(/[^\d]/g, ""),
				    "TimeAtEmployerYears": self.newForm_applicantTimeAtEmployerYears(),
				    "TimeAtEmployerMonths": self.newForm_applicantTimeAtEmployerMonths(),
				    "Occupation": self.newForm_applicantOccupation(),
				    "GrossMonthlyIncome": self.isPersonalApplicant() ? self.newForm_applicantGrossMonthlyIncome() : undefined,
				    "OtherMonthlyIncome": self.isPersonalApplicant() ? self.newForm_applicantOtherMonthlyIncome() : undefined,
				    "SourceOtherMonthlyIncome": self.isPersonalApplicant() ? self.newForm_applicantSourceOtherMonthlyIncome() : undefined
				},
            "BusinessApplicant": {
                "TaxId": _.isUndefined(self.newForm_TaxId()) ? undefined : self.newForm_TaxId().replace(/[^\d]/g, ""),
                "LegalBusinessName": self.newForm_LegalBusinessName(),
                "BusinessPhoneNumber": _.isUndefined(self.newForm_BusinessApplicantPhone()) ? undefined : self.newForm_BusinessApplicantPhone().replace(/[^\d]/g, "")
            },
            "FinanceCompanyId": DE.utilities.readCookie("FinanceCompanyId") ? DE.utilities.readCookie("FinanceCompanyId") : "3",
            "CreditApplicationId": self.selectedApplicationType(),
            "CoApplicant":
				{
				    "FirstName": self.newForm_coApplicantFirstName(),
				    "MiddleInitial": self.newForm_coApplicantMiddleInitial(),
				    "LastName": self.newForm_coApplicantLastName(),
				    "Suffix": self.newForm_coApplicantSuffix(),
				    "EmailAddress": self.newForm_coApplicantEmailAddress(),
				    "SSN": _.isUndefined(self.newForm_coApplicantSSN()) ? undefined : self.newForm_coApplicantSSN().replace(/[^\d]/g, ""),
				    "DateOfBirth": self.newForm_coApplicantDateOfBirth(),
				    "DriversLicenseNumber": self.newForm_coApplicantDriversLicenseNumber(),
				    "DriversLicenseState": self.newForm_coApplicantDriversLicenseState(),
				    "Address": self.newForm_coApplicantAddress(),
				    "POBox": self.newForm_coApplicantPOBox(),
				    "RuralRoute": self.newForm_coApplicantRuralRoute(),
				    "City": self.newForm_coApplicantCity(),
				    "State": self.newForm_coApplicantState(),
				    "Zip": self.newForm_coApplicantZip(),
				    "HomePhone": _.isUndefined(self.newForm_coApplicantHomePhone()) ? undefined : self.newForm_coApplicantHomePhone().replace(/[^\d]/g, ""),
				    "MobilePhone": _.isUndefined(self.newForm_coApplicantMobilePhone()) ? undefined : self.newForm_coApplicantMobilePhone().replace(/[^\d]/g, ""),
				    "TimeAtAddressYears": self.newForm_coApplicantTimeAtAddressYears(),
				    "TimeAtAddressMonths": self.newForm_coApplicantTimeAtAddressMonths(),
				    "HousingStatus": self.newForm_coApplicantHousingStatus(),
				    "MortgageRentPayment": self.isCoApplicantCreditInfoSectionVisible() ? self.newForm_coApplicantMortgageRentPayment() : undefined,
				    "EmploymentStatus": self.newForm_coApplicantEmploymentStatus(),
				    "EmployedBy": self.newForm_coApplicantEmployedBy(),
				    "BusinessPhone": _.isUndefined(self.newForm_coApplicantBusinessPhone()) ? undefined : self.newForm_coApplicantBusinessPhone().replace(/[^\d]/g, ""),
				    "TimeAtEmployerYears": self.newForm_coApplicantTimeAtEmployerYears(),
				    "TimeAtEmployerMonths": self.newForm_coApplicantTimeAtEmployerMonths(),
				    "Occupation": self.newForm_coApplicantOccupation(),
				    "GrossMonthlyIncome": self.isCoApplicantCreditInfoSectionVisible() ? self.newForm_coApplicantGrossMonthlyIncome() : undefined,
				    "OtherMonthlyIncome": self.isCoApplicantCreditInfoSectionVisible() ? self.newForm_coApplicantOtherMonthlyIncome() : undefined,
				    "SourceOtherMonthlyIncome": self.isCoApplicantCreditInfoSectionVisible() ? self.newForm_coApplicantSourceOtherMonthlyIncome() : undefined
				},
            "Vehicle":
				{
				    "StockNumber": self.newForm_vehicleStockNumber(),
				    "VIN": self.newForm_vehicleVIN(),
				    "Model": self.newForm_vehicleModel(),
				    "Trim": self.newForm_vehicleTrim(),
				    "Year": self.newForm_vehicleYear(),
				    "Make": self.newForm_vehicleMake(),
				    "InvoiceValue": self.newForm_vehicleInvoiceValue(),
				    "MSRP": self.newForm_vehicleMSRP(),
				    "ValuationSource": self.newForm_vehicleValuationSource(),
				    "AnnualMileage": self.newForm_AnnualMileage(),
				    "OdometerMileage": self.newForm_vehicleOdometerMileage(),
				    "Condition": self.newForm_vehicleCondition(),
				    "LienHolder": self.newForm_vehicleLienHolder(),
				    "MonthlyPayment": self.newForm_vehicleMonthlyPayment()
				},
            "TradeVehicle":
				{
				    "StockNumber": self.newForm_tradeVehicleStockNumber(),
				    "VIN": self.newForm_tradeVehicleVIN(),
				    "Model": self.newForm_tradeVehicleModel(),
				    "Trim": self.newForm_tradeVehicleTrim(),
				    "Year": self.newForm_tradeVehicleYear(),
				    "Make": self.newForm_tradeVehicleMake(),
				    "InvoiceValue": self.newForm_IsTradeIn() === "true" ? self.newForm_tradeVehicleInvoiceValue() : undefined,
				    "MSRP": self.newForm_IsTradeIn() === "true" ? self.newForm_tradeVehicleMSRP() : undefined,
				    "ValuationSource": self.newForm_tradeVehicleValuationSource(),
				    "OdometerMileage": self.newForm_IsTradeIn() === "true" && self.newForm_tradeVehicleOdometerMileage() !== 0 ? self.newForm_tradeVehicleOdometerMileage() : undefined,
				    "Condition": self.newForm_tradeVehicleCondition(),
				    "LienHolder": self.newForm_tradeVehicleLienHolder(),
				    "MonthlyPayment": self.newForm_IsTradeIn() === "true" ? self.newForm_tradeVehicleMonthlyPayment() : undefined
				},
            "ApplicationId": self.newForm_ApplicationId(),
            "VendorId": self.newForm_VendorId(),
            "ProgramType": self.newForm_ProgramType(),
            "ProductType": self.isProgramTypeChrysler() ? self.newForm_ProductType() : "1",
            "AnnualMileage": self.newForm_AnnualMileage(),
            "ApplicationType": self.newForm_ApplicationType(),
            "IsTradeIn": self.newForm_IsTradeIn(),
            "IsPaymentCall": self.newForm_IsPaymentCall() === true ? "true" : "false",
            "ApplicantRelationship": self.newForm_ApplicantRelationship(),
            "Term": self.newForm_Term() === 0 ? undefined : self.newForm_Term(),
            "CashPrice": self.newForm_CashPrice() === 0 ? undefined : self.newForm_CashPrice(),
            "SalesTax": self.newForm_SalesTax() === 0 ? undefined : self.newForm_SalesTax(),
            "TitleFee": self.newForm_TitleFee() === 0 ? undefined : self.newForm_TitleFee(),
            "CashDown": self.newForm_CashDown() === 0 ? undefined : self.newForm_CashDown(),
            "FrontEndBackEndFees": self.newForm_FrontEndBackEndFees() === 0 ? undefined : self.newForm_FrontEndBackEndFees(),
            "Rebate": self.newForm_Rebate() === 0 ? undefined : self.newForm_Rebate(),
            "NetTrade": self.newForm_NetTrade() === 0 ? undefined : self.newForm_NetTrade(),
            "UnpaidBalance": (self.newForm_UnpaidBalance() === 0 || self.isProductTypeLease()) ? undefined : self.newForm_UnpaidBalance(),
            "Insurance": self.newForm_Insurance() === 0 ? undefined : self.newForm_Insurance(),
            "Gap": self.newForm_Gap() === 0 ? undefined : self.newForm_Gap(),
            "Warranty": self.newForm_Warranty() === 0 ? undefined : self.newForm_Warranty(),
            "EstAmountFinanced": (self.newForm_EstAmountFinanced() === 0 || self.isProductTypeLease()) ? undefined : self.newForm_EstAmountFinanced(),
            "CapCost": (self.newForm_CapCost() === 0) ? undefined : self.newForm_CapCost(),
            "AcqFee": self.newForm_AcqFee(),
            "EstimatedPayment": self.newForm_EstimatedPayment(),
            "Invoice": self.newForm_Invoice(),
            "AdditionalComments": self.newForm_AdditionalComments(),
            "DisclosureStatementAgree": self.newForm_DisclosureStatementAgree() === true ? "true" : "false",
            "RegulationB": (self.newForm_RegulationB_visible()) ? self.newForm_RegulationB() : undefined,
            "SignedPaperApplication": self.newForm_SignedPaperApplication() === true ? "true" : "false",
            "CopyOfPrivacyNotice": self.newForm_CopyOfPrivacyNotice() === true ? "true" : "false",
            "MetaData": self.newForm_MetaData(),
            "SourceIPAddress": self.newForm_SourceIPAddress()
        };
        if (_.isEmpty(self.errors())) {
            DE.proxy.postSubmitNewApp(ko.toJSON(newApplication), self.onNewAppSubmitSuccess);
        }
        else {
            self.errors.showAllMessages();
        }
    };
    DE.proxy.getProgramTypes(self.onProgramTypeSuccess);
    DE.proxy.getIsBalloonEnabled(self.onIsBalloonEnabledSuccess);
    DE.proxy.getProductTypes(self.onProductTypeSuccess);
    DE.proxy.getAnnualMileage(self.onAnnualMileageSuccess);
};
/* User Management */

var EditUserViewModel = function () {
    var self = this;

    self.UserName = ko.observable().extend({ required: true });
    self.RoleId = ko.observable().extend({ required: true });
    self.IsLockedOut = ko.observable();
    self.LastLoginDate = ko.observable();
    self.MembershipId = ko.observable();
    self.VendorId = ko.observable();
    self.FirstName = ko.observable().extend({
        required: true,
        minLength: 2
    });
    self.LastName = ko.observable().extend({
        required: true,
        minLength: 2
    });
    self.WorkPhone = ko.observable();
    self.MobilePhone = ko.observable();
    self.EmailAddress = ko.observable().extend({ required: true, email: true });
    self.Password = ko.observable().extend({
        minLength: 8,
        pattern: {
            message: "Atleast one capitalized letter required",
            params: /^(?=[A-Z]+)\S{8,}$/
        }
    });
    self.ConfirmPassword = ko.observable().extend({ equal: self.Password });
    self.isAcknowledgement = ko.observable().extend({
        equal: {
            message: "Please check this box",
            params: true
        }
    });
    self.Password = ko.observable().extend({
        required: true,
        minLength: 8,
        pattern: {
            message: "Atleast one capitalized letter required",
            params: /^(?=[A-Z]+)\S{8,}$/
        }
    });
    self.ConfirmPassword = ko.observable().extend({ equal: self.Password });

};
var NewUserViewModel = function () {
    var self = this;

    self.UserName = ko.observable().extend({ required: true });
    self.RoleId = ko.observable().extend({ required: true });
    self.IsLockedOut = ko.observable();
    self.LastLoginDate = ko.observable();
    self.MembershipId = ko.observable();
    self.VendorId = ko.observable();
    self.FirstName = ko.observable().extend({
        required: true,
        minLength: 2
    });
    self.LastName = ko.observable().extend({
        required: true,
        minLength: 2
    });
    self.WorkPhone = ko.observable();
    self.MobilePhone = ko.observable();
    self.EmailAddress = ko.observable().extend({ required: true, email: true });
    self.Password = ko.observable().extend({
        required: true,
        minLength: 8,
        pattern: {
            message: "Atleast one capitalized letter required",
            params: /^(?=[A-Z]+)\S{8,}$/
        }
    });
    self.ConfirmPassword = ko.observable().extend({ equal: self.Password });
    self.isAcknowledgement = ko.observable().extend({
        equal: {
            message: "Please check this box",
            params: true
        }
    });
};
var UserDisplayViewModel = function (data) {
    var self = this,
        lockedOut = data.IsLockedOut ? "Yes" : "No",
        lastLoginTimeStamp = moment(data.LastLoginDate).format("MM-DD-YYYY, h:mm a");

    self.userName = ko.observable(data.UserName);
    self.roleName = ko.observable(data.RoleName);
    self.isLockedOut = ko.observable(lockedOut);
    self.lastLoginDate = ko.observable(lastLoginTimeStamp);
    self.membershipId = ko.observable(data.MembershipId);
    self.userVendorId = ko.observable(DE.utilities.readCookie("DealerID"));
    self.adminUserId = ko.observable(DE.utilities.readCookie("UserID"));
};
var UserManagementViewModel = function () {
    var self = this,
        webUsers_UrlAssigned,
        isCreateNewUserRequested = false,
        webUser_UrlAssigned;

    self.vendorId = ko.observable(DE.utilities.readCookie("DealerID"));
    self.webRoleId = ko.observable(DE.utilities.readCookie("WebRoleID"));
    self.adminUserId = ko.observable(DE.utilities.readCookie("UserID"));

    self.webUsers = ko.observableArray([]);
    self.editableUser = new EditUserViewModel();
    self.newUser = new NewUserViewModel();
    self.acknowledgement = ko.observableArray([]);
    self.isDisabled = ko.observable(false);
    self.showLockedOut = ko.observable(false);
    self.unlock = ko.observableArray([]);

    self.roles = ko.observableArray([]);
    self.isUserNameError = ko.observable(false);

    self.loadDropDown = function (arr, data) {
        if ($.isPlainObject(data)) {
            $.each(data, function (i, val) {
                arr.push({ id: i, text: val });
            });
        }
    };
	self.onAllowedRolesSuccess = function (response) {
        self.loadDropDown(self.roles, response);
    };
	self.onGetUserMaintenancePermissionsSuccess = function (response) {
        self.canRemoveUsers = ko.observable(response.CanRemoveUsers);
    };
	self.onNewUserEmailBlur = function () {
        var email = self.newUser.EmailAddress(),
            onEmailSuccess = function (data) {
                var newUserObject = data;
                if (_.isNull(data) === false) {
                    self.acknowledgement([]);
                    self.newUser.UserName(data.UserName);
                    self.newUser.RoleId(data.RoleId);
                    self.newUser.IsLockedOut(data.IsLockedOut);
                    self.newUser.LastLoginDate(data.LastLoginDate);
                    self.newUser.MembershipId(data.MembershipId);
                    self.newUser.VendorId(self.vendorId());
                    self.newUser.FirstName(data.FirstName);
                    self.newUser.LastName(data.LastName);
                    self.newUser.WorkPhone(data.WorkPhone);
                    self.newUser.MobilePhone(data.MobilePhone);
                    self.isDisabled(true);
                }
                else {
                    self.isDisabled(false);
                }
            };

        if (DE.utilities.checkEmptyNullServerResponse(email) &&
            _.isNull(self.newUser.EmailAddress.error)) {
            DE.proxy.getUserByEmail(email, onEmailSuccess);
        }
        else {
            self.newUser.EmailAddress.isModified(true);
        }
    };
	self.onNewUserNameBlur = function () {
        var userName = self.newUser.UserName(),
            onUserNameSuccess = function (data) {
                var newUserObject = data;
                if (data.MembershipId !== 0) {
                    self.isUserNameError(true);
                }
                else {
                    self.isUserNameError(false);
                }
            };

        if (DE.utilities.checkEmptyNullServerResponse(userName) &&
            _.isNull(self.newUser.UserName.error) &&
            self.isDisabled() === false) {
            DE.proxy.getUserByUsername(userName, onUserNameSuccess);
        }
        else {
            self.newUser.UserName.isModified(true);
        }
    };
	self.loadWebUsers = function (vendorId, webRoleId) {
        var onWebUsersSuccess = function (response) {
            $.each(response, function (key, val) {
                self.webUsers.push(new UserDisplayViewModel(this));
            });
        };
        DE.proxy.getWebUsers(vendorId, webRoleId, onWebUsersSuccess);
    };
	self.editUser = function (data, event) {
        var target = (event.currentTarget) ? event.currentTarget : event.srcElement,
            vendorId = self.vendorId(),
            userId = self.adminUserId(),
            webUserId = target.getAttribute("data-webUser-id").toString(),
            onEditUserSuccess = function (data) {
                var editUserObject = data,
                    editUserPassword = data.UserName;

                self.acknowledgement([]);
                self.editableUser.UserName(data.UserName);
                self.editableUser.RoleId(data.RoleId);
                self.editableUser.IsLockedOut(data.IsLockedOut);
                self.showLockedOut(data.IsLockedOut);
                self.editableUser.LastLoginDate(data.LastLoginDate);
                self.editableUser.MembershipId(data.MembershipId);
                self.editableUser.VendorId(data.VendorId);
                self.editableUser.FirstName(data.FirstName);
                self.editableUser.LastName(data.LastName);
                self.editableUser.WorkPhone(data.WorkPhone);
                self.editableUser.MobilePhone(data.MobilePhone);
                self.editableUser.EmailAddress(data.EmailAddress);
                $('#user-management-edit-modal').modal("show");
                $('span.validationMessage').addClass("nextLineError");
            };
        DE.proxy.getWebUser(vendorId, userId, webUserId, onEditUserSuccess);
    };
	self.createUser = function (data, event) {
        var target = (event.currentTarget) ? event.currentTarget : event.srcElement,
            vendorId = self.vendorId(),
            userId = self.adminUserId();
        self.clearObject(self.newUser);
        self.acknowledgement([]);
        self.newUser.VendorId(self.vendorId());
        isCreateNewUserRequested = true;
        $('#user-management-add-modal').modal("show");
        $('span.validationMessage').addClass("nextLineError");
    };
	self.onUpdateUserSubmit = function (obj) {
        var validUserName = _.isNull(obj.UserName.error) && (self.isUserNameError() === false),
            validRoleId = _.isNull(obj.RoleId.error),
            validFirstName = _.isNull(obj.FirstName.error),
            validLastName = _.isNull(obj.LastName.error),
            validPassword = obj === self.newUser ? _.isNull(obj.Password.error) : true,
            validConfirmPassword = obj === self.newUser ? _.isNull(obj.ConfirmPassword.error) : true,
            validAcknowledgement = _.isNull(obj.isAcknowledgement.error),
            validNextStep = validUserName && validRoleId && validPassword && validFirstName && validLastName && validConfirmPassword && validAcknowledgement;
        if (validNextStep === false) {
            if (validUserName === false) obj.UserName.isModified(true);
            if (validRoleId === false) obj.RoleId.isModified(true);
            if (validFirstName === false) obj.FirstName.isModified(true);
            if (validLastName === false) obj.LastName.isModified(true);
            if (validPassword === false) obj.Password.isModified(true);
            if (validConfirmPassword === false) obj.ConfirmPassword.isModified(true);
            if (validAcknowledgement === false) obj.isAcknowledgement.isModified(true);
        }
        return validNextStep;
    };
	self.onSubmit = function () {
        var userData,
            onSubmitSuccess = function (response) {
                if (isCreateNewUserRequested) {
                    $('#user-management-add-modal').modal("hide");
                    isCreateNewUserRequested = false;
                }
                else {
                    $('#user-management-edit-modal').modal("hide");
                }
                $('#modal-submit-success').modal('show');
            };

        if (isCreateNewUserRequested) {
            if (self.isDisabled()) {
                if (self.onUpdateUserSubmit(self.newUser)) {
                    userData = ko.toJSON(self.newUser);
                    DE.proxy.postAddExistingUser(userData, self.vendorId(), self.newUser.MembershipId(), onSubmitSuccess);
                }
            }
            else {
                if (self.onUpdateUserSubmit(self.newUser)) {
                    userData = ko.toJSON(self.newUser);
                    DE.proxy.postCreateWebUser(userData, self.adminUserId(), self.vendorId(), onSubmitSuccess);
                }
            }
        }
        else {
            if (self.onUpdateUserSubmit(self.editableUser)) {
                userData = ko.toJSON(self.editableUser);
                DE.proxy.postUpdateWebUser(userData, self.adminUserId(), onSubmitSuccess);
            }
        }
    };
	self.removeUser = function (data, event) {
        var target = (event.currentTarget) ? event.currentTarget : event.srcElement,
            vendorId = self.vendorId(),
            userId = self.adminUserId(),
            webUserId = target.getAttribute("data-webUser-id").toString(),
            onRemoveUserSuccess = function (response) {
                $("#remove-user").modal("hide");
                $('#modal-submit-success').modal('show');
            };
		$("#remove-user").modal("show");
        $("#removeUser").on("click", function (event) {
            event.preventDefault();
            DE.proxy.postRemoveWebUser(userId, vendorId, webUserId, onRemoveUserSuccess);
            $("#removeUser").off("click");
        });
    };
	self.deleteUser = function (data, event) {
        var target = (event.currentTarget) ? event.currentTarget : event.srcElement,
            vendorId = self.vendorId(),
            userId = self.adminUserId(),
            webUserId = target.getAttribute("data-webUser-id").toString(),
            onDeleteUserSuccess = function (response) {
                $("#delete-user").modal("hide");
                $('#modal-submit-success').modal('show');
            };
		$("#delete-user").modal("show");
        $("#deleteUser").on("click", function (event) {
            event.preventDefault();
            DE.proxy.postDeleteWebUser(userId, webUserId, onDeleteUserSuccess);
            $("#deleteUser").off("click");
        });
    };
	self.acknowledgement.subscribe(function (value) {
        if (_.isEmpty(value) === false && _.isUndefined(value) === false) {
            if (isCreateNewUserRequested) {
                self.newUser.isAcknowledgement(_.contains(value, "disclosure"));
            }
            else {
                self.editableUser.isAcknowledgement(_.contains(value, "disclosure"));
            }
        }
        else {
            self.editableUser.isAcknowledgement(false);
            self.newUser.isAcknowledgement(false);
        }
    } .bind(self));

    self.unlock.subscribe(function (value) {
        if (_.isEmpty(value) === false && _.isUndefined(value) === false) {
            if (self.showLockedOut()) {
                self.editableUser.IsLockedOut(_.contains(value, "unlock") == false);
            }
        }
        else {
            self.editableUser.IsLockedOut(true);
        }
    } .bind(self));

    self.clearObject = function (obj) {
        _.each(obj, function (item) {
            item("");
        });
        self.isUserNameError(false);
    };
	self.onUpdateUserModalClose = function () {
        if (isCreateNewUserRequested) {
            self.clearObject(self.newUser);
            $('#user-management-add-modal').modal("hide");
            isCreateNewUserRequested = false;
        }
        else {
            self.clearObject(self.editableUser);
            $('#user-management-edit-modal').modal("hide");
        }
    };
	$('#user-management-edit-modal').on("hidden", function () {
        self.onUpdateUserModalClose();
    });

    $('#user-management-add-modal').on("hidden", function () {
        self.onUpdateUserModalClose();
    });

    $('#delete-user').on("hidden", function () {
        $("#deleteUser").off("click");
    });

    $('#remove-user').on("hidden", function () {
        $("#removeUser").off("click");
    });

    DE.proxy.getAllowedRoles(self.vendorId(), self.adminUserId(), self.onAllowedRolesSuccess);
    self.loadWebUsers(self.vendorId(), self.webRoleId());
    DE.proxy.getUserMaintenancePermissions(self.adminUserId(), self.onGetUserMaintenancePermissionsSuccess);
};

/* Bindings */

var self = this,
    moduleMap = {
        "Funding": {
            module: "funding",
            setSize: 100,
            paging: true,
            callBackMethod: "GetContract",
            numberOfDays: 30
        },
        "Applications": {
            module: "application",
            setSize: 100,
            paging: true,
            callBackMethod: "GetApplication",
            numberOfDays: 30
        },
        "Leads": {
            module: "leads",
            setSize: 100,
            paging: true,
            callBackMethod: "GetLeadsDetails",
            numberOfDays: 90
        },
        "UserManagement": {
            module: "usermanagement"
        }
    },
    attributes = moduleMap[$('#page-header .page-title').text()],
    __slideDeckItems,
    __vendorDetails,
    __advancedSearch,
    __login,
    __reset,
    __sGuard,
    __dashboardData,
    __submitNewApp,
    __leadDropDown,
    __headerPrimaryViewModel,
    __headerSecondaryViewModel,
    __logoSection,
    __changePassword,
    __fundingsRedirect,
    __footerViewModel,
    __acknowledgement;

if ($("#loginSection").length) {
    __login = new LoginViewModel();
    ko.applyBindings(__login, document.getElementById("loginSection"));
    ko.applyBindingsWithValidation(__login, document.getElementById("loginSection"), { messagesOnModified: false });
}

if ($("#headerPrimaryNavigation").length) {
    __headerPrimaryViewModel = new HeaderPrimaryViewModel();
    ko.applyBindings(__headerPrimaryViewModel, document.getElementById("headerPrimaryNavigation"));
}

if ($("#headerSecondaryNavigation").length) {
    __headerSecondaryViewModel = new HeaderSecondaryViewModel();
    ko.applyBindings(__headerSecondaryViewModel, document.getElementById("headerSecondaryNavigation"));
}

if ($("#adminBar").length) {
    __vendorDetails = new VendorAssignmentViewModel(attributes);
    ko.applyBindings(__vendorDetails, document.getElementById("adminBar"));
}

if ($("#logoSection").length) {
    __logoSection = new LogoSectionViewModel();
    ko.applyBindings(__logoSection, document.getElementById("logoSection"));
}

if ($("#loginAssistance").length) {
    __reset = new ResetPasswordUsernameViewModel();
    ko.applyBindings(__reset, document.getElementById("loginAssistance"));
}

if ($("#changePassword").length) {
    __changePassword = new ChangePasswordViewModel();
    ko.applyBindings(__changePassword, document.getElementById("changePassword"));
}

if ($("#fundingsRedirect").length) {
    __fundingsRedirect = new FundingsRedirectViewModel();
    ko.applyBindings(__fundingsRedirect, document.getElementById("fundingsRedirect"));
}

if ($("#sGuardLinks").length) {
    __sGuard = new SguardViewModel();
    ko.applyBindings(__sGuard, document.getElementById("sGuardLinks"));
}

if ($("#performanceDashboard").length) {
    __dashboardData = new DE.dashboard.PerformanceDashboardViewModel();
    ko.applyBindings(__dashboardData, document.getElementById("performanceDashboard"));
}

if ($("#footerNavigation").length) {
    __footerViewModel = new FooterViewModel();
    ko.applyBindings(__footerViewModel, document.getElementById("footerNavigation"));
}

if ($("#legalAcknowledgement").length) {
    __acknowledgement = new AcknowledgementViewModel();
    ko.applyBindings(__acknowledgement, document.getElementById("legalAcknowledgement"));
}

if ($("#leadsDropDown").length) {
    __leadDropDown = new LeadsDropDownViewModel();
    $("#saveStatusButton").off('click');
    ko.applyBindings(__leadDropDown, document.getElementById("leadsStatus"));
}

if ($("#preApplySection").length) {
    __submitNewApp = new SubmitNewApplicationViewModel();
    ko.applyBindings(__submitNewApp, document.getElementById("applicationDetails"));
}

if ($("#userManagement").length) {
    __userManagement = new UserManagementViewModel();
    ko.applyBindings(__userManagement, document.getElementById("userManagement"));
}

if (attributes) {
    __slideDeckItems = new SlideDeckViewModel(slideDeckItemClickHandler, attributes),
    __advancedSearch = new AdvanceSearchViewModel(attributes);
    ko.applyBindings(__slideDeckItems, document.getElementById("sidebar"));
    ko.applyBindings(__advancedSearch, document.getElementById("search-modal"));
}

applySiteSettings(DE.lookups.siteSettingsParams);