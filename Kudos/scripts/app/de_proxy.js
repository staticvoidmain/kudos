(function (parent, $, _) {

	//#region Variables

	if (typeof ($) === undefined || typeof (_) === undefined) {
		throw 'jQuery and Underscore plugins are required, please ensure it is loaded before loading this javascript';
	}

	var proxy = parent.proxy = parent.proxy || {},
        isWrapped;


	//#region Private methods

	function errorHandler(responseStatus) {
		//$("#serverErrorText").text(DE.lookups.errorMessage[responseStatus].errorText);
		//$("#serverErrorBtn").text(DE.lookups.errorMessage[responseStatus].errorButtonText);
		$(".modal.in").modal("hide");
		$("#serverError").modal('show').on('hidden', function () {
			$("#serverErrorText, #serverErrorBtn").text("");
			if (DE.lookups.errorMessage[responseStatus].redirectToHome) {
				if (DE.utilities.readCookie("TargetPage")) {
					window.location.href = "/SSOOops.htm";
				}
				else {
					window.location.href = "/home";
				}
			}
			return true;
		});
	};

	function ajaxRequest(url, type, data, successCallback, failureCallback, before) {
		$.ajax({
			type: type,
			dataType: 'json',
            cache: false,
			async: false,
			timeout: 30 * 1000,
			contentType: "application/json",
			url: url,
			data: data,
			beforeSend: before ? before : "",
			complete: function () {
				$.unblockUI();
			},
			success: successCallback,
			error: failureCallback
		});
		return false;
	};

	function ajaxCall(url, type, data, successCallback, failureCallback, before, stopBlockUI) {
		var disableBlockUI = _.isUndefined(stopBlockUI) ? false : stopBlockUI;
		if (DE.utilities.readCookie("AuthHeader")) { trackSession.start(); }
		if (disableBlockUI === false) {
			$.blockUI();
			setTimeout(function () {
				ajaxRequest(url, type, data, successCallback, failureCallback, before);
			}, 200);
		}
		else {
			ajaxRequest(url, type, data, successCallback, failureCallback, before);
		}
	};

	function intercept(target, prop, wrapped, before, after, args) {
		target[prop] = function () {
			before && before(prop, args);
			wrapped(args);
			after && after(prop, args);
		};
	};

	function wrap(target, before, after) {
		for (window.prop in target) {
			if (target.hasOwnProperty(window.prop)) {
				var wrapped = target[window.prop];
				if (typeof wrapped === "function") {
					intercept(target, window.prop, wrapped, before, after, arguments);
				}
			}
		}
	};

	function begin(name, args) {
		console.log(name + " service call begin");
		if (args.length) {
			console.log("Arguments for service call are: " + args);
		}
	};

	function end(name) {
		console.log(name + " service call ended");
	};

	//#region Constructors

	//#region Public methods

	proxy.defaultFailureHandler = function (response) {
		errorHandler(response.status);
	};

	proxy.login = function (onSuccess, onFailure, beforeSend) {
		var url = '/api/authentication/login';
		ajaxCall(url, "POST", "", onSuccess, onFailure, beforeSend);
	};

	proxy.getRoles = function (webRoleId, onSuccess) {
		var url = "/api/HeaderFooter/GetHeaderFooterInfo/?webRole=" + webRoleId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getChryslerRedirect = function (onSuccess) {
		var url = "../api/authentication/sendsso";
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.postAcknowledgement = function (data, onSuccess) {
		var url = "../api/Acknowledgement/acceptSuccess";
		ajaxCall(url, "POST", data, onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getDashboardData = function (vendorId, companyId, onSuccess) {
		var url = "../dashboard/getdashboard/?vendorid=" + vendorId + "&financeCompanyId=" + companyId; ;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getSlideDeckItems_normal = function (module, vendorId, appDays, onSuccess) {
		var url = "/" + module + "/basicsearch?vendorid=" + vendorId + "&numberofdays=" + appDays;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getSlideDeckItems_hyundai = function (module, webRoleId, latestId, onSuccess) {
	    var url = "/" + module + "/externalapplication/?webRoleId=" + webRoleId + "&externalApplicationId=" + latestId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getAdvancedSearch = function (module, vendorId, criteria, startDate, endDate, onSuccess) {
		var url = "/" + module + "/advancedsearch?vendorid=" + vendorId + "&searchCriteria=" + criteria + "&startDate=" + startDate + "&endDate=" + endDate;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

    proxy.getSlideDeckItemDetail = function (module, appId, vendorId, onSuccess, isPrequalificationApp) {
		var url;
		if (module === "leads") {
		    url = "/" + module + "/leadsdetails?applicationID=" + appId + "&vendorID=" + vendorId + "&isPrequalificationApp=" + isPrequalificationApp;
		} else {
			url = "/" + module + "/contract?id=" + appId;
		}
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getLatestNote = function (appId, category, onSuccess) {
		var url = "/funding/getLatestNote?applicationId=" + appId + "&noteCategory=" + category;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
    };

    proxy.getIsBalloonEnabled = function (onSuccess) {
        var url = "/application/isballoonenabled";
        ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
    };

	proxy.getAllNotes = function (appId, category, onSuccess) {
		var url = "/funding/getAllNotes?applicationId=" + appId + "&noteCategory=" + category;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getDecisionDetail = function (appId, onSuccess) {
		var url = "/api/decision?id=" + appId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getFundingDiscountVariance = function (appId, onSuccess) {
		var url = "/funding/getfundingdiscount?applicationId=" + appId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getFundingAdjustmentFeeForDiscountVariance = function (appId, onSuccess) {
		var url = "/funding/getfundingadjustments?applicationId=" + appId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.postContactFunder = function (data, onSuccess, onFailure) {
		var url = "/funding/postcontactfunder";
		ajaxCall(url, "POST", data, onSuccess, onFailure, "");
	};

	proxy.postValidateFundingDocument = function (data, onSuccess, onFailure) {
		var url = "/funding/validatefundingdocument";
		ajaxCall(url, "POST", data, onSuccess, onFailure, "");
	};

	proxy.getCategoryData = function (onSuccess) {
		var url = "/funding/category";
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getRecentDocument = function (appId, onSuccess) {
		var url = "funding/getrecentdocuments?applicationId=" + appId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getLastApproval = function (appId, onSuccess) {
		var url = "api/rehash/lastapproval?applicationid=" + appId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getVehicle = function (vin, onSuccess) {
		var url = "api/vehicle/vehicle?vin=" + vin;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getVehicleYear = function (condition, onSuccess) {
		var url = "api/vehicle/year?vehicleClassification=" + condition;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getVehicleMake = function (year, onSuccess) {
		var url = "api/vehicle/make?year=" + year;
		;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getVehicleModel = function (year, make, onSuccess) {
		var url = "api/vehicle/model?year=" + year + "&make=" + make;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getVehicleTrim = function (year, make, model, onSuccess) {
		var url = "api/vehicle/trim?year=" + year + "&make=" + make + "&model=" + model;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getVehicleCondition = function (onSuccess) {
		var url = "api/vehicle/classification";
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getVehicleConditionByProductType = function (type, onSuccess) {
		var url = "/application/vehicleclassification?product=" + type;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.postRehashCalculate = function (data, onSuccess) {
		var url = "api/rehash/calculate";
		ajaxCall(url, "POST", data, onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getRehashCopy = function (appId, onSuccess) {
		var url = "api/rehash/copy?applicationId=" + appId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getRehashWebPermissions = function (userId, onSuccess) {
		var url = "api/rehash/getRehashWebPermissions?webMembershipId=" + userId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.postRehashSubmit = function (data, onSuccess) {
		var url = "api/rehash/submit";
		ajaxCall(url, "POST", data, onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.postRehashFinalize = function (data, onSuccess) {
		var url = "api/rehash/finalize";
		ajaxCall(url, "POST", data, onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.postContactAnalyst = function (data, onSuccess, onFailure) {
		var url = "/application/contactanalyst";
		ajaxCall(url, "POST", data, onSuccess, onFailure, "");
	};

	proxy.getApplicationStatus = function (onSuccess) {
		var url = "leads/dealerapplicantstatus";
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.postApplicationStatus = function (data, onSuccess, onFailure) {
		var url = "leads/postdealerapplicantstatus";
		ajaxCall(url, "POST", data, onSuccess, onFailure, "");
	};

	proxy.postAppointmentTime = function (data, onSuccess, onFailure) {
		var url = "leads/postappointmenttime";
		ajaxCall(url, "POST", data, onSuccess, onFailure, "");
	};

	proxy.getOffer = function (appId, onSuccess) {
		var url = "leads/offers?applicationid=" + appId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.postOffer = function(data, onSuccess, onFailure) {
		var url = "leads/postoffer";
		ajaxCall(url, "POST", data, onSuccess, onFailure, "");
	};

	proxy.getCityState = function (zip, onSuccess) {
		var url = "/application/citystate?zipcode=" + zip;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getApplicationTypes = function (onSuccess) {
		var url = "api/list/applicationtypes";
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getProgramTypes = function (onSuccess) {
		var url = "api/list/programtypes";
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getProductTypes = function (onSuccess) {
		var url = "api/list/producttypes";
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getAnnualMileage = function (onSuccess) {
		var url = "api/list/annualmileage";
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getValuationSource = function (onSuccess) {
		var url = "api/list/stippedbooktypes";
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getHousingStatus = function (onSuccess) {
		var url = "api/list/housingstatuses";
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getEmploymentStatus = function (onSuccess) {
		var url = "api/list/employmentstatuses";
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getSuffix = function (onSuccess) {
		var url = "api/list/suffix";
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getRelationshipStatus = function (onSuccess) {
		var url = "api/list/relationshiptypes";
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.postSubmitNewApp = function (data, onSuccess) {
		var url = "/application/submitapplication";
		ajaxCall(url, "POST", data, onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getWebUsers = function (vendorId, webRoleId, onSuccess) {
		var url = "/usermanagement/webusers?vendorId=" + vendorId + "&webRole=" + webRoleId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getWebUser = function (vendorId, userId, webUserId, onSuccess) {
		var url = "/usermanagement?vendorid=" + vendorId + "&userId=" + userId + "&webuserid=" + webUserId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getWebUser = function (vendorId, userId, webUserId, onSuccess) {
		var url = "/usermanagement/webuser?vendorid=" + vendorId + "&userId=" + userId + "&webuserid=" + webUserId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.postUpdateWebUser = function (data, webMembershipId, onSuccess) {
		var url = "/usermanagement/update?webMembershipId=" + webMembershipId;
		ajaxCall(url, "POST", data, onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.postCreateWebUser = function (data, webMembershipId, vendorId, onSuccess) {
		var url = "/usermanagement/create?webMembershipId=" + webMembershipId + "&vendorId=" + vendorId;
		ajaxCall(url, "POST", data, onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.postRemoveWebUser = function (webMembershipId, vendorId, removedUserId, onSuccess) {
		var url = "/usermanagement/remove?webMembershipId=" + webMembershipId + "&vendorId=" + vendorId + "&removeUserId=" + removedUserId;
		ajaxCall(url, "POST", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.postDeleteWebUser = function (webMembershipId, deletedUserId, onSuccess) {
		var url = "/usermanagement/delete?webMembershipId=" + webMembershipId + "&deleteUserId=" + deletedUserId;
		ajaxCall(url, "POST", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getUserByEmail = function (email, onSuccess) {
		var url = "/usermanagement/getuserbyemail?email=" + email;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getAllowedRoles = function (vendorId, webMembershipId, onSuccess) {
		var url = "/usermanagement/allowedroles?vendorId=" + vendorId + "&webMembershipId=" + webMembershipId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getUserMaintenancePermissions = function (webMembershipId, onSuccess) {
		var url = "/usermanagement/getUserMaintenancePermissions?webMembershipId=" + webMembershipId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.postAddExistingUser = function (data, vendorId, webMembershipId, onSuccess) {
		var url = "/usermanagement/addexistinguser?vendorId=" + vendorId + "&webMembershipId=" + webMembershipId;
		ajaxCall(url, "POST", data, onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getUserByUsername = function (username, onSuccess) {
		var url = "/usermanagement/getuserbyname?userName=" + username;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.postResetPassword = function (username, email, onSuccess) {
		var url = "/usermanagement/reset?userName=" + username + "&email=" + email;
		ajaxCall(url, "POST", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.postChangePassword = function (webMembershipId, newPassword, onSuccess) {
		var url = "/usermanagement/changepassword?webMembershipId=" + webMembershipId + "&newPassword=" + newPassword;
		ajaxCall(url, "POST", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getVendorIdList = function (webMembershipId, onSuccess) {
		var url = "/usermanagement/vendor?webMembershipId=" + webMembershipId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "");
	};

	proxy.getVendorName = function (vendorId, onSuccess) {
		var url = "../application/vendorname?dealerId=" + vendorId;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.postQuestionAnswer = function (webMembershipId, question, answer, onSuccess) {
		var url = "/usermanagement/savequestionanswer?webMembershipId=" + webMembershipId + "&question=" + question + "&answer=" + answer;
		ajaxCall(url, "POST", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getQuestion = function (email, onSuccess) {
		var url = "/usermanagement/getquestion?email=" + email;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	proxy.getValidateAnswer = function (email, answer, onSuccess) {
		var url = "/usermanagement/validateanswer?email=" + email + "&answer=" + answer;
		ajaxCall(url, "GET", "", onSuccess, proxy.defaultFailureHandler, "", true);
	};

	// DO NOT TOUCH THIS - YOU SHOULD NEVER HAVE TO LOOK AT FOLLOWING CODE

	proxy.enableLogging = function () {
		if (!isWrapped && typeof console !== "undefined") {
			wrap(proxy, begin, end);
		}
		isWrapped = true;
	};

} (DE, jQuery, _));