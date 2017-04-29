var mainApp = angular.module('MainApp', ['ngRoute', 'ngResource']);

var Parameters = {
    cityName: 'ALL',
    minDate : '01.01.2016',
    maxDate : '01.01.2017'
};
var DataFromDB = 'empty';
var DataFromAPI = 'empty';

mainApp.config(['$routeProvider', function ($routeProvider){
    $routeProvider
        .when('/showFromDB', {
            templateUrl: 'views//showFromDB.html',
            controller: ''
        })
        .when('/forecast', {
            templateUrl: 'views//forecast.html'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);