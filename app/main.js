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
        .when('/login', {
            templateUrl: 'views//user/login.html'
        })
        .when('/editUserInfo', {
            templateUrl: 'views//user/editUserInfo.html'
        })
        .when('/registration', {
            templateUrl: 'views//user/registration.html'
        })
        .when('/main/page/:page', {
            templateUrl: 'views//main.html',
            controller: 'MainCtrl'
        })
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