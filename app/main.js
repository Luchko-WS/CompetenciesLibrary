var mainApp = angular.module('MainApp', ['ngRoute', 'ngResource']);

mainApp.config(['$routeProvider', function ($routeProvider){
    $routeProvider
        //TEST PAGE
        .when('/test', {
            templateUrl: 'views//testView.html'
        })
        //MAIN PAGE
		.when('/', {
           templateUrl: 'views//main.html'
        })
        .when('/main', {
            templateUrl: 'views//main.html'
        })
        //IMPORT/EXPORT
        .when('/download', {
            templateUrl: 'views//io//downloadPage.html'
        })
        .when('/upload', {
            templateUrl: 'views//io//uploadPage.html'
        })
        //EDIT VIEW
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
        .when('/actions/id/:id/object/create', {
            templateUrl: 'views//actions//object//createAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/object/:itemID/copy', {
            templateUrl: 'views//actions//object//copyAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/object/:itemID/edit', {
            templateUrl: 'views//actions//object//editAction.html',
            controller: 'ActionsCtrl'
        })
        .when('/actions/id/:id/object/:itemID/remove', {
            templateUrl: 'views//actions//object//removeAction.html',
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
        //OBJECT
        .when('/object/create', {
            templateUrl: 'views//libraryItems//object//objectCreate.html'
        })
        .when('/object/:id/edit', {
            templateUrl: 'views//libraryItems//object//objectEdit.html',
            controller: 'ObjectsCtrl'
        })
        .when('/object/:id/show', {
            templateUrl: 'views//libraryItems//object//objectShow.html',
            controller: 'ObjectsCtrl'
        })
        //INDICATOR
        .when('/object/:objectID/indicator/create', {
            templateUrl: 'views//libraryItems//indicator//indicatorCreate.html',
            controller: 'IndicatorsCtrl'
        })
        .when('/object/:objectID/indicator/:id/edit', {
            templateUrl: 'views//libraryItems//indicator//indicatorEdit.html',
            controller: 'IndicatorsCtrl'
        })
        .when('/object/:objectID/indicator/:id/show', {
            templateUrl: 'views//libraryItems//indicator//indicatorShow.html',
            controller: 'IndicatorsCtrl'
        })
        //GROUP
        .when('/group/create', {
            templateUrl: 'views//libraryItems//group//groupCreate.html'
        })
        .when('/group/:id/edit', {
            templateUrl: 'views//libraryItems//group//groupEdit.html',
            controller: 'GroupsCtrl'
        })
        .otherwise({
            templateUrl: 'views//errorPage.html',
            controller: ''
        });
}]);

mainApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('jwtInterceptor');
}]);

/**
 БЛОК ІНІЦІАЛІЗАЦІЇ ВЕБ-ДОДАТКУ
 **/
mainApp.run(['$rootScope', 'ActionModel', 'AuthModel', function ($rootScope, ActionModel) {
    //Змінні дерева та поточної групи
    //Використовуються в головній сторінці, створенні, редагуванні об'єктів та груп
    $rootScope.$tree = null;
    $rootScope.$currentGroup = null;

    //Отримання даних про користувача зі сховища браузера
    var authUser = window.localStorage.getItem('authUser');
    $rootScope.$user = authUser ? JSON.parse(authUser) : null;
    //Кількість нових дій
    $rootScope.$countOfActions = '';

    //Отримання кількості нових дій для поточного користувача
    $rootScope.initActionDataForUser = function () {
        if($rootScope.$user) {
            var params = {
                actionID: 'init',
                userID: $rootScope.$user.id
            };
            ActionModel.get({'id': JSON.stringify(params)}, function (res) {
                if (res.data === undefined) {
                    console.log('Не вдалось ініціалізувати список дій для користувача (res.data === undefined)');
                }
                else {
                    console.log(res.data);
                    if (Number(res.data.count) != 0) {
                        $rootScope.$countOfActions = res.data.count;
                    }
                    $rootScope.$user.firstActionID = Number(res.data.firstActionID);
                    $rootScope.$user.lastActionID = Number(res.data.lastActionID);
                    window.localStorage.setItem('authUser', JSON.stringify($rootScope.$user));
                }
            }, function (err) {
                console.log('Не вдалось ініціалізувати список дій для користувача');
                console.log(err);
            });
        }
    };
    $rootScope.initActionDataForUser();
}]);
/**
 КІНЕЦЬ БЛОКУ ІНІЦІАЛІЗАЦІЇ ВЕБ-ДОДАТКУ
 **/

//Кнопка перегортання сторінки вверх
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