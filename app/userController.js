mainApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('jwtInterceptor');
}]);

mainApp.run(['$rootScope', function ($rootScope) {
    $rootScope.logout = function () {
        $rootScope.$user = null;
        window.localStorage.removeItem('authToken');
        window.localStorage.removeItem('authUser');
    };

    var authUser = window.localStorage.getItem('authUser');
    $rootScope.$user = authUser ? JSON.parse(authUser) : null;
}]);

mainApp.controller('UserController', ['$scope', '$rootScope', 'AuthModel', function ($scope, $rootScope, AuthModel) {
    $scope.user = {};

    $scope.login = function () {
        console.log('user', $scope.user);

        $scope.message = null;

        /* DON'T WORK!!!!
        AuthModel.login($scope.user, function (res) {
            res = res.toJSON();
            console.log('res', res);
            window.localStorage.setItem('authToken', res.token);
            window.localStorage.setItem('authUser', JSON.stringify(res.user));
            $rootScope.$user = res.user;
            console.log($rootScope.$user);
        }, function (err) {
            console.log('err', err.data);
        });
        */

        var params =  {
            login: $scope.user.login,
            password: $scope.user.password
        };

        console.log(params);

        AuthModel.get({'id':JSON.stringify(params)}, function (res) {
            res = res.toJSON();
            console.log('res', res);
            window.localStorage.setItem('authToken', res.token);
            window.localStorage.setItem('authUser', JSON.stringify(res.user));
            $rootScope.$user = res.user;
            console.log($rootScope.$user);
        }, function (err) {
            $scope.message = "Невірний логін чи пароль!";
            console.log('err', err.data);
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
        });

        $scope.login();
    };

    $scope.loadCurrentUserInfo = function () {
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
        }, function (err) {
            console.log('err', err.data);
        });

        $rootScope.$user.firstName = $scope.user.firstName;
        $rootScope.$user.secondName = $scope.user.secondName;
        $rootScope.$user.organization = $scope.user.organization;
        window.localStorage.setItem('authUser', JSON.stringify($rootScope.$user));

        $scope.message = "Дані користувача збережено!";
    };

    $scope.validateEmailAdress = function () {
        var pattern = /^[a-z0-9_-]+@[a-z0-9-]+\.([a-z]{1,6}\.)?[a-z]{2,6}$/i;
        if ($scope.user.login.search(pattern) != 0) {
            $scope.message = "Невірний формат електронної пошти!";
            return false;
        }
        else{
            return true;
        }
    };

    $scope.validatePassword = function () {
        var pattern = /^[a-z0-9_-]/i;

        if($scope.user.password == undefined){
            $scope.message = "Довжина пароля має бути не менше 8 символів!";
            return false;
        }
        else if ($scope.user.password.length < 8) {
            $scope.message = "Довжина пароля має бути не менше 8 символів!";
            return false;
        }
        else if ($scope.user.password.search(pattern) != 0) {
            $scope.message = "Пароль має невірний формат!";
            return false;
        }
        else if($scope.user.password != $scope.user.confirmPassword){
            $scope.message = "Вміст полів 'Пароль' і 'Повторіть пароль' не співпадають!";
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
            $scope.message = "Не вірний старий пароль!";
            return false;
        });
        return true;
    };

    $scope.validateRegistrationForm = function () {
        $scope.message = null;

        if(!$scope.validateEmailAdress()){
            return false;
        }
        else if(!$scope.validatePassword()){
            return false;
        }
        else if(!$scope.user.firstName){
            $scope.message = "Поле імені не має бути порожнім!";
            return false;
        }
        else if(!$scope.user.secondName){
            $scope.message = "Поле прізвища не має бути порожнім!";
            return false;
        }
        return true;
    };

    $scope.validateEditForm = function () {
        $scope.message = null;

        if($scope.changePassword) {
            if (!$scope.validateOldPassword()) {
                return false;
            }
            else if (!$scope.validatePassword()) {
                return false;
            }
        }

        if(!$scope.user.firstName){
            $scope.message = "Поле імені не має бути порожнім!";
            return false;
        }
        else if(!$scope.user.secondName){
            $scope.message = "Поле прізвища не має бути порожнім!";
            return false;
        }
        return true;
    };

    $scope.buttonText = "Змінити пароль";
    $scope.changePassword = false;
    $scope.onChangePasswordButtonClick = function () {
        if($scope.buttonText == "Змінити пароль"){
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

}]);
