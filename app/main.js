var mainApp = angular.module('MainApp', ['ngRoute', 'ngResource']);

//edit modes
const MODE_NO_EDIT = 0;
const MODE_EDIT_SKILL = 1;
const MODE_EDIT_INDICATOR = 2;
const MODE_EDIT_GROUP = 3;
const MODE_ADD_SKILL = 4;
const MODE_ADD_INDICATOR = 5;
const MODE_ADD_GROUP = 6;

var globalEditParams = {
    skill: 'NONE',
    indicator: 'NONE',
    group: 'NONE',
    edit_mode: MODE_NO_EDIT,
    additional_data: "NONE"
};

var additionalData = "";

mainApp.config(['$routeProvider', function ($routeProvider){
    $routeProvider
        .when('/editSkill', {
            templateUrl: 'views//editView.html'
        })
        .when('/editIndicator', {
            templateUrl: 'views//editView.html'
        })
        .when('/editGroup', {
            templateUrl: 'views//editView.html'
        })
        .when('/tree', {
            templateUrl: 'views//treeView.html'
        })
        .when('/main', {
            templateUrl: 'views//mainView.html'
        })
        .otherwise({
            templateUrl: 'views//errorPage.html',
            controller: ''
        });
}]);