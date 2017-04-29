var mainApp = angular.module('MainApp', ['ngRoute', 'ngResource']);

var DataFromDB = 'empty';

mainApp.config(['$routeProvider', function ($routeProvider){
    $routeProvider
        .when('/edit', {
            templateUrl: 'views//editView.html'
        })
        .otherwise({
            templateUrl: 'views//mainView.html',
            controller: ''
        });
}]);