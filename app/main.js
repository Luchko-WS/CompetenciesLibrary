var mainApp = angular.module('MainApp', ['ngRoute', 'ngResource']);

//edit modes
const MODE_NO_EDIT = 0;
const MODE_EDIT_SKILL = 1;
const MODE_EDIT_INDICATOR = 2;
const MODE_EDIT_CATALOG = 3;

var globalEditParams = {
    skill: 'NONE',
    indicator: 'NONE',
    group: 'NONE',
    edit_mode: MODE_NO_EDIT
};

mainApp.config(['$routeProvider', function ($routeProvider){
    $routeProvider
        .when('/editSkill', {
            templateUrl: 'views//editView.html'
        })
        .when('/editIndicator', {
            templateUrl: 'views//editView.html'
        })
        .otherwise({
            templateUrl: 'views//mainView.html',
            controller: ''
        });
}]);