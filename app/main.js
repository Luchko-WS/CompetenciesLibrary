/*
    Edit modes

    const MODE_NO_EDIT = 0;
    const MODE_EDIT_SKILL = 1;
    const MODE_EDIT_INDICATOR = 2;
    const MODE_EDIT_GROUP = 3;
    const MODE_ADD_SKILL = 4;
    const MODE_ADD_INDICATOR = 5;
    const MODE_ADD_GROUP = 6;
    const MODE_VIEW_SKILL = 7;
    const MODE_VIEW_INDICATOR = 8;
*/

var globalEditParams = {
    skill: 'NONE',
    indicator: 'NONE',
    group: 'NONE',
    edit_mode: 0,
    additional_data: "NONE"
};
var additionalData = "";

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
        .when('/skill', {
            templateUrl: 'views//skill.html'
        })
        .when('/indicator', {
            templateUrl: 'views//indicator.html'
        })
        .when('/group', {
            templateUrl: 'views//group.html'
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