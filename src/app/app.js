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

        .state('logout', {
            views: {
                "layer": {
                    template: "logout",
                    controller: function($scope) {
                        $scope.logout();
                    }
                },
            }
        })
        .state('preferences', {
            views: {
                "layer": {
                    templateUrl: "preferences/template.tpl.html",
                    controller: function($scope,$http) {
                        var url="https://laos.buddycloud.com/api/notification_settings";
                        $scope.preferences={type: "email"};
                        $scope.savepreferences=function(){
                            console.log("prefs",$scope.preferences);
                            $http({'method': 'POST','url':url,'withCredentials': true,'data':$scope.preferences}).then(function(response){
                                console.log("saved");
                            },function(error){
                                console.log("error saving preferences",error);
                            });
                        }                        
                        $http({method: 'GET',url:url+"?type=email",withCredentials: true}).then(function(response){
                            console.log(response);
                            for(var item in response.data[0]){
                                switch(response.data[0][item]){
                                    case "true":
                                        $scope.preferences[item]=true;
                                        break;
                                    case "false":
                                        $scope.preferences[item]=false;
                                        break;
                                    default:
                                        $scope.preferences[item]=response.data[0][item];
                                }
    
                            }
                            console.log("$SCOPE",$scope);
                        },function(error){
                            console.log("can't load preferences",error);
                        }); 
                    }
                },
            }
        })
 
        .state('find', {
            views: {
                "layer": {
                    templateUrl:"find/template.tpl.html",
                    controller: function($scope,$http) {
                        console.log("find",$scope.xmpp.data.me);
                        var user=$scope.xmpp.data.me.jid.user+"@"+$scope.xmpp.data.me.jid.domain;
                        var url="https://laos.buddycloud.com/api/recommendations?max=5&user="+user;
                        $http.get(url).then(function(response){
                                console.log(response);
                                $scope.recomondatations=response.data;
                        });
                        console.log("recommondations",url);
                    }
                }
            }

        })
        .state('createnode', {

            views: {
                "layer": {
                    templateUrl: "createnode/template.tpl.html",
                    controller: function($scope,$state) {
                        $scope.save = function() {
                            console.log($scope.form);
                            console.log($scope);
                            var node='/user/' + $scope.form[0].value + '@laos.buddycloud.com/posts';
                            $scope.stream.buddycloud.createNode({
                                'node': node,
                                'options': $scope.form
                            }).then(function(){
                                console.log("auf mach");
                                $state.go('node', { node: node });
                            }).then(function(error){
                                console.log("create error",error);
                            });
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


.controller('page', ['$scope', '$rootScope', '$location','$http',
    function($scope, $rootScope, $location,$http) {


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
            console.log("changenode",node);
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
                },function(error){
                    console.log("login error");
                });
            }else{
                $scope.xmpp.data.connected=false;   //bad style
            }
        }
        $scope.login = function(username, password, register, stayloggedin) {
            if (username.indexOf("@") === -1) {
                username = username + '@laos.buddycloud.com';   //bad bad bad
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
            },function(error){
                console.log("login error",error);
            });
            $scope.httplogin(username,password);
        }
        $scope.httplogin = function(username,password) {
            console.log("httplogin with",username,password);
            $http.defaults.headers.common['Authorization'] = 'Basic ' + btoa(username + ':' + password);
            $http.get("https://laos.buddycloud.com/api/subscribed").then(function(response){
                console.log("drin",response);
            },function(error){
                console.log("login error",error);
            });
        }
        $scope.logout = function() {
            console.log("logout");
            localStorage.removeItem("username");
            localStorage.removeItem("password");
            $scope.xmpp.send('xmpp.logout').then(function(){
                console.log("---------finished-----");
            });
            console.log("by3bye");
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
