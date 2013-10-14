var kudos = kudos || { };

(function () {
    "use strict";

    kudos.models = {
        IndexViewModel: function(kudos, events) {
            var self = this;

            function findUser() {
                kudos.findUser()
            }

            self.searchText = ko.observable();
            self.matchingUsers = ko.observableArray([]);

            self.searchText.subscribe(function (val) {
                console.log("find users matching" + val);

                var findUserResult = findUser(val);

                // okay, strategy: 
                //  if the first letter has been typed
                // todo: get 

            });

            self.thumbsUp = function () {
                kudos.sendThumbsUp({ "user": "rjennings" });
                events.echo("thumbs up!");
            };

            self.hatsOff = function () {
                kudos.sendHatsOff({ "user": "rjennings" });
                events.echo("hats off!");
            };
        },

        Profile: function () {
            // todo: stuff
        }
    };
} ( ));