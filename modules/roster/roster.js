angular.module('XmppUI', ['XmppCore'])

/*
Roster
*/

.directive('xmpproster', function() {
    return {
        'restrict': 'E',
        'scope': {
        },
        'transclude': false,
        'templateUrl': 'modules/roster/template.html',
        'controller': 'XmppUiRoster',
        'link': function(scope, element, attrs) {
            console.log("roster");
            /*
            scope.$watch("node", function() {
                console.log("node changed");
                if (scope.node == "recent") {
                    scope.getRecentItems();
                } else {
                    scope.getNodeItems(scope.node);
                }
            });
            */
        }
    };
})


    .controller('XmppUiRoster', ['$scope','$rootScope', '$location', '$anchorScroll','Xmpp',
        function($scope, $rootScope,$location, $anchorScroll,Xmpp) {
            SCOPE = $scope;
            $scope.username = "seppl";
            $scope.password = "bbb";
            var socket=Xmpp.socket;
            $scope.roster=Xmpp.roster;

            $scope.openchat=function(user){
                console.log("openchat",user.jid.user+"@"+user.jid.domain);
                $rootScope.$broadcast('openchat',user.jid.user+"@"+user.jid.domain);
            };


            socket.on('xmpp.connection', function(data) {
                console.log("connect",data);
                $scope.jid=data.jid;
                $scope.connected=true;

                //vCard - not working
                socket.send('xmpp.vcard.get', {}, function(error, data) {
                    consle.log(error, data);
                })

                Xmpp.getRoster().then(function(data){
                    console.log("roster",data);
                    Xmpp.setPresence();
                });
            });





        }
    ])