// actions:
// Actions for items: reply to item, delete, update, block user, like, make a user a moderator, change a user from a being able to post to being read-only

/**
* Buddycloud module provides a timeline.
@module buddycloud
*/


var BC = null;
var BCAPI = null;
var LIKE = null;




angular.module('Buddycloud', [])

/**
Directive
@ngdoc directive
*/

.directive('buddycloud', function() {
    return {
        'require': '^xmpp',
        'restrict': 'E',
        'scope': {
            'search': '@',
            'node': '@',
            'jid': '=',
            'onchangenode': '&onchangenode',
            'oninit': '&oninit'
        },
        'transclude': false,
        'templateUrl': 'buddycloud/template.tpl.html',
        'controller': 'buddycloudController',
        'link': function(scope, element, attrs, xmppController) {


            //scope.node = attrs.node;
            scope.$watch("node",function(){
                if(scope.buddycloud){
                    if(attrs.node=='recent'){
                        scope.node='recent';
                        //scope.stream.buddycloud.recent();
                        scope.buddycloud.recent();
                    }else{
                        console.log(attrs.node);
                        scope.buddycloud.open({node:attrs.node});
                    }
                }
            });


            if (xmppController.xmpp.data.connected) {
                scope.init(xmppController.xmpp);
            } else {
                xmppController.on("connected", function(s, status) {
                    scope.init(xmppController.xmpp);
                });

            }

        }
    };
})





//todo: put more to factory, controll is tool long

.controller('buddycloudController', ['$scope', 'BuddycloudFactory',
    function($scope, BuddycloudFactory) {
        BC=$scope;
        $scope.editmode={};
        $scope.showconfigform=false;
        $scope.init=function(xmpp){
            $scope.buddycloud=new BuddycloudFactory(xmpp);
            console.log("--",$scope.buddycloud);
            $scope.buddycloud.init().then(function(){
                console.log("bc init");
                if($scope.node){
                    if($scope.node=="recent"){
                        $scope.buddycloud.recent();
                    }else{
                        $scope.buddycloud.open({node:$scope.node});
                    }
                }else{

                }
            },function(error){
                console.log("bc error",error);
            });
        }
        $scope.setConfig=function(data){
            console.log("this is buddyclodu.js",data);
            $scope.buddycloud.send("xmpp.buddycloud.config.set",{node:$scope.buddycloud.data.currentnode,form:data});
        }
        $scope.opennode=function(id){
            console.log(id);
            var node="/user/"+id+"/posts";
            $scope.onchangenode({node:node});
        }
        $scope.deleteNode=function(){
            $scope.buddycloud.send("xmpp.buddycloud.delete",{node:$scope.buddycloud.data.currentnode}).then(function(){;
                console.log("deleted node");
                $scope.onchangenode({node:"recent"});
            });
        }
        $scope.gravatar=function(jid){
            if(typeof(jid)=="string"){
                var jidstring=jid
            }else{
                var jidstring=jid.user+"/"+jid.domain;
            }
            console.log("avatar for",jidstring);
            var hash=hashCode(jidstring);
            var url= "http://www.gravatar.com/avatar/"+hash+"?d=monsterid&f=y";
            return url;
        }
        hashCode = function(s){
          return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
        }
        $scope.oninit({scope:$scope});
    }
])


.filter("gravatar",function(){
     return function(jid){
            if(!jid){
                jid="fehler@teufel.com";
            }
            var jidstring='recent';
            if(typeof(jid)=="string"){
                if(jid!=='recent'){
                    var jidstring=trimjidstring(jid);
                }
//                var jidstring=jid;
            }else{
                var jidstring=jid.user+"@"+jid.domain;
            }
            var hash=hashCode(jidstring);
            var url= "http://www.gravatar.com/avatar/"+hash+"?d=monsterid&f=y";
            return url;
    };
    function hashCode(s){
      var s= s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
        s=Math.abs(parseInt(s));
      return s;
    }

    function trimjidstring(jid){
        var user=jid.split("@")[0];
        var domain=jid.split("@")[1];
        if(user.indexOf("/")!==-1){
                user=user.substring(user.lastIndexOf("/")+1);
        }
        if(domain.indexOf("/")!==-1){
                console.log(domain);
                domain=domain.substring(0,domain.indexOf("/"));
                console.log(domain);
        }
        return user+"@"+domain;
    }

}

);
