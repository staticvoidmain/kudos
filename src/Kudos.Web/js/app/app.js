$(function () {
    "use strict";

    var eventProxy = new kudos.proxy.EventProxy(),
        kudosProxy = new kudos.proxy.KudosProxy(),
        vm = new kudos.models.IndexViewModel(kudosProxy, eventProxy);

    ko.applyBindings(vm);
});