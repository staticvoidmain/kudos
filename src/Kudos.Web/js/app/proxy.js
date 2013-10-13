var kudos = kudos || {};

(function () {
    "use strict";

    kudos.proxy = {
        KudosProxy: function () {
            this.sendHatsOff = function () { };
            this.sendThumbsUp = function () { };
            this.getUsers = function () { };
        },
        EventProxy: function (connection) {
            var connection = $.hubConnection('/kudos/signalr');
            var events = connection.createHubProxy('eventHub');

            events.on('echo', function (e) {
                toastr.info(e);
            });

            this.echo = function (message) {
                events.invoke("echo", message)
                    .done(function (value) { console.log('SUCCESS: ' + value); })
                    .fail(function (error) { console.log('ERROR: ' + error); });;
            };

            connection.start()
                .done(function () { console.log('SUCCESS: Now connected as ' + connection.id); })
                .fail(function () { console.log('ERROR: Could not Connect!'); });
        }
    };
}());