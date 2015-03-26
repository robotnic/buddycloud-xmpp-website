var SCOPE = null;

angular.module('XmppApp', [
    'templates-app', 'templates-common', 'AngularXmpp', 'XmppUI', 'btford.markdown', 'tagged.directives.infiniteScroll', 'ngSanitize', 'ui.bootstrap', 'angularMoment', 'ui.router'
])

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('index', {
            url: "/index",
            views: {
                "main": {
                    controller: function($scope) {
                        console.log("content"); 
                    }
                },
            }

        })
        .state('node', {
            url: "^/node/:node",
            views: {
                "main": {
                    template:"xxx",
                    controller: function($scope) {
                        console.log("+++++++++++index.node++++++++++");
                    }
                },
            }

        })

        .state('exit', {
            url: "/logout",
            views: {
                "layers": {
                    template: "logout",
                    controller: function($scope) {
                        $scope.xmpp.data.me = null;
                        $scope.xmpp.logout();
                    }
                },
            }
        })
        .state('find', {
            url: "/find",
            views: {
                "layer": {
                    templateUrl:"find/template.tpl.html",
                    controller: function($scope) {
                        console.log("find");
                    }
                }
            }

        })
        .state('createnode', {
            url: "^/createnode",
            views: {
                "layer": {
                    templateUrl: "createnode/template.tpl.html",
                    controller: function($scope) {
                        $scope.save = function() {
                            console.log($scope.form);
                            console.log($scope);
                            $scope.stream.buddycloud.send('xmpp.buddycloud.create', {
                                'node': '/user/' + $scope.form[0].value + '@laos.buddycloud.com/posts',
                                'options': $scope.form
                            })
                        };
                        $scope.form = [{
                            "var": "name",
                            "value": ""
                        }, {
                            "var": "buddycloud#channel_type",
                            "value": "topic"
                        }, {
                            "var": "buddycloud#default_affiliation",
                            "value": "publisher"
                        }, {
                            "var": "pubsub#access_model",
                            "value": "open"
                        }, {
                            "var": "pubsub#description",
                            "value": "this is a test."
                        }, {
                            "var": "pubsub#title",
                            "value": "this is the title"
                        }]
                    }
                },

            }
        })
})


.controller('page', ['$scope', '$rootScope', '$location',
    function($scope, $rootScope, $location) {


$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    console.log(event, toState, toParams, fromState, fromParams);
    console.log(toState.name);
    if(toState.name=="index" || toState.name=="node"){
        $scope.hidestream=false;
    }else{
        $scope.hidestream=true;
    }
    if(toState.name=="node"){
        console.log("toParams",toParams);
        $scope.changenode(toParams.node);
    }
    $scope.showsettings=false;
  });


        //        function page($scope, $rootScope, $location) {
        SCOPE = $scope;
        $scope.node = "recent";
        $scope.openchat = function(node) {
            console.log("openchat", node);
            $scope.xmpp.openchat($scope.xmpp.parseNodeString(node).jid);
        }
        $scope.changenode = function(node) {
            $scope.node = node;
            $scope.nodeuser = $scope.xmpp.parseNodeString(node);
            //$location.hash(node);
        }
        $scope.open = function(jid) {
            console.log("buddycloud node",jid);
            $scope.changenode(jid);
        };
        $scope.initbuddycloud = function(bc) {
            $scope.stream = bc;  
            console.log("-------bc", bc);
        }
        $scope.initxmpp = function(xmpp) {
            $scope.xmpp = xmpp;
            var username = localStorage.getItem("username");
            var password = localStorage.getItem("password");
            if (username && password) {
                xmpp.send('xmpp.login', {
                    jid: username,
                    password: password,
                    resource: 'angular-xmpp',
                    register: false
                }).then(function() {
                    $scope.jid = $scope.xmpp.data.me.jid.user + "@" + $scope.xmpp.data.me.jid.domain;
                    //xmpp.send("xmpp.presence");
                    //xmpp.send("xmpp.roster.get");
                });
            }

        }
        $scope.login = function(username, password, register, stayloggedin) {
            if (username.indexOf("@") === -1) {
                username = username + '@laos.buddycloud.com';
            }
            if (stayloggedin) {
                localStorage.setItem("username", username);
                localStorage.setItem("password", password);
            }
            console.log(username, password, register);
            $scope.xmpp.send('xmpp.login', {
                jid: username,
                password: password,
                resource: 'angular-xmpp',
                register: register
            }).then(function() {
                $scope.jid = $scope.xmpp.data.me.jid.user + "@" + $scope.xmpp.data.me.jid.domain;
                $scope.xmpp.send("xmpp.presence");
                $scope.xmpp.send("xmpp.roster.get");
            });

        }
        $scope.logout = function() {
            console.log("logout");
            localStorage.removeItem("username");
            localStorage.removeItem("password");
            $scope.xmpp.socket.send('xmpp.logout');
        }
        $scope.showxmpp = function() {
            console.log("xmpp", $scope.xmpp, $scope.buddycloud); //debug
        }
        $scope.initchat = function(chat) {
            $scope.chat = chat;
        }


        $scope.find=function(text){
          var stanza = {
                form: [{
                    "var": 'content',
                    "value": text
                }]
            };
            $scope.stream.buddycloud.send( 'xmpp.buddycloud.search.do', stanza).then(function(data){
                console.log(data);
                $scope.findresults=data;
            });
        }


    }
])
