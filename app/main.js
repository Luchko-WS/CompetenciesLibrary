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
            templateUrl: 'views//adminEditView.html'
        })
        .when('/editIndicator', {
            templateUrl: 'views//adminEditView.html'
        })
        .when('/editGroup', {
            templateUrl: 'views//adminEditView.html'
        })
        .when('/test', {
            templateUrl: 'views//testView.html'
        })
        .when('/adminView', {
            templateUrl: 'views//adminMainView.html'
        })
        .when('/main', {
            templateUrl: 'views//guestMainView.html'
        })
        .when('/skill', {
            templateUrl: 'views//guestSkillAndIndicatorView.html'
        })
        .when('/indicator', {
            templateUrl: 'views//guestSkillAndIndicatorView.html'
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