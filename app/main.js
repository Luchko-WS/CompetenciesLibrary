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
        .when('/main/group/:id', {
            templateUrl: 'views//main.html',
            controller: 'SkillCtrl'
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
        .when('/editLibrary', {
            templateUrl: 'views//editView.html'
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
            templateUrl: 'views//actions//actions.html'
        })
        .when('/actions/id/:id', {
            templateUrl: 'views//actions//loadActionPage.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/skill/create', {
            templateUrl: 'views//actions//skill//createAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/skill/:itemID/copy', {
            templateUrl: 'views//actions//skill//copyAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/skill/:itemID/edit', {
            templateUrl: 'views//actions//skill//editAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/skill/:itemID/remove', {
            templateUrl: 'views//actions//skill//removeAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/group/create', {
            templateUrl: 'views//actions//group//createAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/group/:itemID/copy', {
            templateUrl: 'views//actions//group//copyAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/group/:itemID/edit', {
            templateUrl: 'views//actions//group//editAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/group/:itemID/remove', {
            templateUrl: 'views//actions//group//removeAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/indicator/create', {
            templateUrl: 'views//actions//indicator//createAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/indicator/:itemID/edit', {
            templateUrl: 'views//actions//indicator//editAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/indicator/:itemID/remove', {
            templateUrl: 'views//actions//indicator//removeAction.html',
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

$(document).ready(function () {
    $(window).scroll(function () {
        if($(this).scrollTop() != 0){
            $('#toTop').fadeIn();
        }
        else{
            $('#toTop').fadeOut();
        }
    });

    $('#toTop').click(function () {
        $('body, html').animate({scrollTop: 0});
    });
});