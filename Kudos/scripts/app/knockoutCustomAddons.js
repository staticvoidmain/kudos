(function (factory) {
    factory(ko);
} (function (ko) {

    if (typeof (ko) === undefined || typeof (ko.validation) === undefined) { throw 'Knockout and Knockout Validation plugin is required, please ensure it is loaded before loading this custom addon javascript'; }

    ko.underscoreTemplateEngine = function () { };
    ko.underscoreTemplateEngine.prototype = ko.utils.extend(new ko.templateEngine(), {
        renderTemplateSource: function (templateSource, bindingContext, options) {
            var precompiled = templateSource['data']('precompiled');
            if (!precompiled) {
                precompiled = _.template("{{ with($data) { }} " + templateSource.text() + " {{ } }}");
                templateSource['data']('precompiled', precompiled);
            }
            var renderedMarkup = precompiled(bindingContext).replace(/\s+/g, " ");
            return ko.utils.parseHtmlFragment(renderedMarkup);
        },
        createJavaScriptEvaluatorBlock: function (script) {
            return "{{= " + script + " }}";
        }
    });

    ko.setTemplateEngine(new ko.underscoreTemplateEngine());

    ko.bindingHandlers['class'] = {
        'update': function (element, valueAccessor) {
            if (element['__ko__previousClassValue__']) {
                ko.utils.toggleDomNodeCssClass(element, element['__ko__previousClassValue__'], false);
            }
            var value = ko.utils.unwrapObservable(valueAccessor());
            ko.utils.toggleDomNodeCssClass(element, value, true);
            element['__ko__previousClassValue__'] = value;
        }
    };

    ko.bindingHandlers.stopBinding = {
        init: function () {
            return { controlsDescendantBindings: true };
        }
    };

    ko.bindingHandlers.tooltip = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var valueUnwrapped = ko.utils.unwrapObservable(valueAccessor());
            $(element).tooltip({
                title: valueUnwrapped
            });
        },
        update: function (element, valueAccessor) {
            var valueUnwrapped = ko.utils.unwrapObservable(valueAccessor());
            $(element).attr('data-original-title', valueUnwrapped);
        }
    };

    ko.validation.rules['conditional_required'] = {
        validator: function (val, condition) {
            var required = false;
            if (typeof condition == 'function') {
                required = condition();
            }
            else {
                required = condition;
            }
            if (required) {
                return !(val == undefined || val == null || val.length == 0);
            }
            else {
                return true;
            }
        },
        message: "This field is required"
    }

    ko.validation.rules['conditional_required_checkbox'] = {
        validator: function (val, condition) {
            var required = false;
            if (typeof condition == 'function') {
                required = condition();
            }
            else {
                required = condition;
            }
            if (required) {
                return !(val == undefined || val == null || val.length == 0 || val == false);
            }
            else {
                return true;
            }
        },
        message: "Please check this box"
    }

    ko.validation.rules['no_future_date'] = {
        validator: function (val, condition) {
            var required = false;
            if (typeof condition == 'function') {
                required = condition();
            }
            else {
                required = condition;
            }
            if (required) {
                return !(val && moment(val).diff(moment()) > 0);
            }
            else {
                return true;
            }
        },
        message: "Future date not allowed"
    }

    ko.validation.rules['minimum_age_state_based'] = {
        validator: function (val, condition) {
            var required = condition();
            if (required) {
                return !(val && Math.abs(moment(val).diff(moment(), 'years', true)) < required);
            }
            else {
                return true;
            }
        },
        message: "The applicants date of birth does not meet minimum age requirements for credit. Must be {0} years of age"
    }

    ko.validation.rules['validate_vin'] = {
        validator: function (val, params) {
            var temp = false,
                pattern = /^[^\WIOQ]{17}$/i,
                serverValidate = function () {
                    DE.proxy.getVehicle(val, function (response) {
                        if (response.IsValidVin && DE.utilities.vehicleAgeChecker(params.vehicleCondition(), "1", response.Year)) {
                            temp = response.IsValidVin;
                            params.serverValidCallback(response, params.vinType);
                        }
                        else return false;
                    });
                };
            var simpleValidate = val !== undefined && val !== '';
            if (simpleValidate) {
                if (pattern.test(val)) {
                    serverValidate();
                    return temp;
                }
                else {
                    params.simpleInvalidCallback(params.vinType);
                    return false; 
                }
            }
            else {
                params.simpleInvalidCallback(params.vinType);
                return true;
            }
        },
        message: "Invalid vin"
    }

    ko.validation.rules['non_zero_number'] = {
        validator: function (val, condition) {
            var required = false,
                pattern = /^[\d\-\.]+$/;
            if (typeof condition == 'function') {
                required = condition();
            }
            else {
                required = condition;
            }
            if (required) {
                return (pattern.test(val) && parseFloat(val) !== 0);
            }
            else {
                return true;
            }
        },
        message: "Only a non-zero number is allowed"
    }

    ko.validation.rules.pattern.message = 'Invalid.';

    ko.validation.configure({
        registerExtenders: true,
        messagesOnModified: true,
        insertMessages: true,
        parseInputAttributes: true,
        messageTemplate: null
    });

}));