mainApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('jwtInterceptor');
}]);

mainApp.run(['$rootScope', 'ActionModel', 'AuthModel', function ($rootScope, ActionModel, AuthModel) {
    $rootScope.logout = function () {
        $rootScope.$user = null;
        $rootScope.$tree = null;
        $rootScope.$currentGroup = null;
        $rootScope.$countOfActions = '';
        window.localStorage.removeItem('authToken');
        window.localStorage.removeItem('authUser');
    };

    $rootScope.setLastActionIDForUser = function (lastActionID) {
        if(lastActionID) {
            var value = {
                userID: $rootScope.$user.id,
                lastActionID: lastActionID
            };
            AuthModel.save(value, function (res) {
                console.log(res);
            }, function (err) {
                console.log('err', err.data);
            });
        }
    };

    var authUser = window.localStorage.getItem('authUser');
    $rootScope.$user = authUser ? JSON.parse(authUser) : null;
    $rootScope.$countOfActions = '';

    $rootScope.getLastActionIDForUser = function () {
        if($rootScope.$user) {
            var params = {
                actionID: 'COUNT_OF_ACTIONS',
                lastActionID: $rootScope.$user.lastActionID,
                userID: $rootScope.$user.id
            };
            console.log(params);
            ActionModel.get({'id': JSON.stringify(params)}, function (res) {
                if (res.data === undefined) {
                    console.log('ERROR');
                }
                else {
                    console.log(res.data);
                    if (Number(res.data) != 0) {
                        $rootScope.$countOfActions = res.data;
                    }
                }
            });
        }
    };
    $rootScope.getLastActionIDForUser();
}]);

mainApp.controller('UsersController', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'AuthModel', 'ActionModel',
    function ($scope, $rootScope, $http, $location, $routeParams, AuthModel) {
    $scope.user = {};

    ///////////////////////////////////
    //INTERFACE BLOCK
    ///////////////////////////////////
    //Message block
    //begin
    $scope.messageTitleText = null;
    $scope.messageText = null;
    $("#closeMessageBoxButton").click(function () {
        $('#messageBox').fadeOut("slow");
    });
    $scope.messageBoxClass = null;
    //end

    $scope.buttonText = "Змінити пароль";
    $scope.changePassword = false;
    $scope.onChangePasswordButtonClick = function (flag) {
        if(flag){
            $scope.buttonText = "Не змінювати пароль";
            $scope.changePassword = true;
        }
        else{
            $scope.buttonText = "Змінити пароль";
            $scope.changePassword = false;
            $scope.user.oldPassword = "";
            $scope.user.password = "";
            $scope.user.confirmPassword = "";
        }
    };

    $scope.login = function () {
        $scope.message = null;
        var params =  {
            login: $scope.user.login,
            password: $scope.user.password
        };
        AuthModel.login({'id':JSON.stringify(params)}, function (res) {
            res = res.toJSON();
            window.localStorage.setItem('authToken', res.token);
            window.localStorage.setItem('authUser', JSON.stringify(res.user));
            $rootScope.$user = res.user;
            $rootScope.getLastActionIDForUser();
        }, function (err) {
            $scope.message = "Невірний логін чи пароль!";
            console.log('err', err.data);
            $scope.messageTitleText = "Помилка!";
            $scope.messageText = "Невірний логін чи пароль!";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");

        });
    };

    $scope.registerUser = function () {
        if(!$scope.validateRegistrationForm()){
            return;
        }
        var value =  {
            login: $scope.user.login,
            password: $scope.user.password,
            firstName: $scope.user.firstName,
            secondName: $scope.user.secondName,
            organization: $scope.user.organization,
            userID: -1
        };
        AuthModel.save(value, function(res){
            console.log(res);
        }, function (res) {
            console.log(res);
            console.log("Помилка при реєстрації!");
            $scope.messageTitleText = "Користувача не зареєстровано!";
            $scope.messageText = "Не вдалося зареєструвати користувача.";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
        });
        $scope.login();
    };

    $scope.loadCurrentUserInfo = function () {
        $("#toggleButton").click(function () {
            $("#toggleBox").slideToggle("normal");
        });

        if($rootScope.$user) {
            $scope.user.firstName = $rootScope.$user.firstName;
            $scope.user.secondName = $rootScope.$user.secondName;
            $scope.user.organization = $rootScope.$user.organization;
        }
    };

    $scope.saveUserInfo = function () {
        if(!$scope.validateEditForm()){
            return;
        }
        var value =  {
            login: $rootScope.$user.login,
            password: $scope.user.password,
            firstName: $scope.user.firstName,
            secondName: $scope.user.secondName,
            organization: $scope.user.organization,
            userID: $rootScope.$user.id,
            changePassword: $scope.changePassword
        };

        AuthModel.save(value, function(res){
            console.log(res);
            console.log("Дані про користувача оновлено!");
            $scope.messageTitleText = "Дані користувача оновлено!";
            $scope.messageText = "Дію успішно виконано. Ваші дані оновлено.";
            $scope.messageBoxClass = "alert alert-success";
            $('#messageBox').fadeIn("slow");

            $rootScope.$user.firstName = $scope.user.firstName;
            $rootScope.$user.secondName = $scope.user.secondName;
            $rootScope.$user.organization = $scope.user.organization;
            window.localStorage.setItem('authUser', JSON.stringify($rootScope.$user));
        }, function (err) {
            console.log('err', err.data);
            console.log("Дані про користувача не оновлено!");
            $scope.messageTitleText = "Дані користувача не оновлено!";
            $scope.messageText = "Не вдалося оновити Ваші дані.";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
        });
    };

    $scope.validateEmailAdress = function () {
        var pattern = /^[a-z0-9_-]+@[a-z0-9-]+\.([a-z]{1,6}\.)?[a-z]{2,6}$/i;
        if (!$scope.user.login || $scope.user.login.search(pattern) != 0) {
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Невірний формат електронної пошти!";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
            return false;
        }
        else{
            return true;
        }
    };

    $scope.validatePassword = function () {
        var pattern = /^[a-z0-9_-]/i;

        if(!$scope.user.password || $scope.user.password.length < 8) {
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Довжина пароля має бути не менше 8 символів!";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
            return false;
        }
        else if ($scope.user.password.search(pattern) != 0) {
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Пароль має невірний формат!";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
            return false;
        }
        else if($scope.user.password != $scope.user.confirmPassword){
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Вміст полів 'Пароль' і 'Повторіть пароль' не співпадають!";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
            return false;
        }
        return true;
    };

    $scope.validateOldPassword = function () {
        var params =  {
            login: $rootScope.$user.login,
            password: $scope.user.oldPassword
        };
        AuthModel.get({'id':JSON.stringify(params)}, function (res) {
            res = res.toJSON();
            console.log('res', res);
        }, function (err) {
            console.log('err', err.data);
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Не вірний старий пароль!";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
            return false;
        });
        return true;
    };

    $scope.validateRegistrationForm = function () {
        if(!$scope.validateEmailAdress()){
            return false;
        }
        else if(!$scope.validatePassword()){
            return false;
        }
        else if(!$scope.user.firstName){
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Поле імені не має бути порожнім!";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
            return false;
        }
        else if(!$scope.user.secondName){
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Поле прізвища не має бути порожнім!";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
            return false;
        }
        return true;
    };

    $scope.validateEditForm = function () {
        if($scope.changePassword) {
            if (!$scope.validateOldPassword()) {
                return false;
            }
            else if (!$scope.validatePassword()) {
                return false;
            }
        }

        if(!$scope.user.firstName){
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Поле імені не має бути порожнім!";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
            return false;
        }
        else if(!$scope.user.secondName){
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Поле прізвища не має бути порожнім!";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
            return false;
        }
        return true;
    };
}]);
