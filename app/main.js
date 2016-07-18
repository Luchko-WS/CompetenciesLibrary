var additionalData = "";

var A = null;
//APP
var mainApp = angular.module('MainApp', ['ngRoute', 'ngResource']);

mainApp.config(['$routeProvider', function ($routeProvider){
    $routeProvider
        .when('/test', {
            templateUrl: 'views//testView.html'
        })
        .when('/main', {
            templateUrl: 'views//main.html'
        })
        /*
         .when('/main/page/:page', {
         templateUrl: 'views//main.html',
         controller: 'MainCtrl'
         })
         */
        .when('/download', {
            templateUrl: 'views//downloadPage.html'
        })
        //USER
        .when('/login', {
            templateUrl: 'views//user/login.html'
        })
        .when('/editUserInfo', {
            templateUrl: 'views//user/editUserInfo.html'
        })
        .when('/registration', {
            templateUrl: 'views//user/registration.html'
        })
        //ACTIONS
        .when('/actions', {
            templateUrl: 'views//action//actions.html'
        })
        .when('/actions/id/:id', {
            templateUrl: 'views//action//loadActionPage.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/skill/create', {
            templateUrl: 'views//action//skill//createAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/skill/:itemID/edit', {
            templateUrl: 'views//action//skill//editAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/skill/:itemID/remove', {
            templateUrl: 'views//action//skill//removeAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/group/create', {
            templateUrl: 'views//action//group//createAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/group/:itemID/edit', {
            templateUrl: 'views//action//group//editAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/group/:itemID/remove', {
            templateUrl: 'views//action//group//removeAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/indicator/create', {
            templateUrl: 'views//action//indicator//createAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/indicator/:itemID/edit', {
            templateUrl: 'views//action//indicator//editAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/indicator/:itemID/remove', {
            templateUrl: 'views//action//indicator//removeAction.html',
            controller: 'ActionsCtrl'
        })
        //ITEMS
        .when('/skill/create', {
            templateUrl: 'views//skill//skillCreate.html'
        })
        .when('/skill/:id/edit', {
            templateUrl: 'views//skill//skillEdit.html',
            controller: 'SkillsCtrl'
        })
        .when('/skill/:id/show', {
            templateUrl: 'views//skill//skillShow.html',
            controller: 'SkillsCtrl'
        })
        .when('/skill/:skillId/indicator/create', {
            templateUrl: 'views//indicator//indicatorCreate.html',
            controller: 'IndicatorsCtrl'
        })
        .when('/skill/:skillId/indicator/:id/edit', {
            templateUrl: 'views//indicator//indicatorEdit.html',
            controller: 'IndicatorsCtrl'
        })
        .when('/skill/:skillId/indicator/:id/show', {
            templateUrl: 'views//indicator//indicatorShow.html',
            controller: 'IndicatorsCtrl'
        })
        .when('/group/create', {
            templateUrl: 'views//group//groupCreate.html'
        })
        .when('/group/:id/edit', {
            templateUrl: 'views//group//groupEdit.html',
            controller: 'GroupsCtrl'
        })
        .otherwise({
            templateUrl: 'views//errorPage.html',
            controller: ''
        });
}]);

mainApp.filter('divideToPages', function () {
    return function (item) {
        var vector = [];
        if(item!=null)
        {
            if (item.length % 5 == 0) {
                for (var i = 1; i <= item.length / 5; i++) {
                    vector.push(i);
                }
            }
            else {
                for (var i = 1; i <= item.length / 5 + 1; i++) {
                    vector.push(i);
                }
            }
        }
        return vector;
    };
});