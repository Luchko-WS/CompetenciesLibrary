mainApp.controller('UsersController', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'AuthModel', 'ActionModel',
    function ($scope, $rootScope, $http, $location, $routeParams, AuthModel) {

    //Модель
    $scope.user = {};

    /**
     БЛОК ІНТЕРФЕЙСУ
     **/
    //ПОВІДОМЛЕННЯ
    $scope.messageBoxClass = null;
    $scope.messageTitleText = null;
    $scope.messageText = null;
    //Виведення повідомлення
    function showMessageWindow(messageClass, messageTittle, messageBody) {
        $scope.messageTitleText = messageTittle;
        $scope.messageText = messageBody;
        $scope.messageBoxClass = messageClass;
        $('#messageBox').fadeIn("slow");
		setTimeout("$('#messageBox').hide('slow')", 5000);
    }
    //Кнопка закриття повідомлення
    $("#closeMessageBoxButton").click(function () {
        $('#messageBox').fadeOut("slow");
    });

    //ЗМІНА ПАРОЛЮ
    $scope.buttonText = "Змінити пароль";
    $scope.changePassword = false;
    $scope.onChangePasswordButtonClick = function (isHide) {
        if(isHide){
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
    $("#toggleButton").click(function () {
        $("#toggleBox").slideToggle("normal");
    });

    //Заповнення поля форми даними користувача
    $scope.loadCurrentUserInfo = function () {
        if($rootScope.$user) {
            $scope.user.firstName = $rootScope.$user.firstName;
            $scope.user.secondName = $rootScope.$user.secondName;
            $scope.user.organization = $rootScope.$user.organization;
        }
    };
    /**
     КІНЕЦЬ БЛОКУ ІНТЕРФЕЙСУ
     **/

    /**
     БЛОК ВХОДУ/ВИХОДУ
     **/
    //Вхід користувача в систему
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
            $rootScope.initActionDataForUser();
			$location.path('\main');
        }, function (err) {
            console.log(err);
            $scope.message = "Невірний логін чи пароль!";
            showMessageWindow("alert alert-danger", "Помилка!", "Невірний логін чи пароль!");
        });
    };

    //Вихід користувача з системи
    $scope.logout = function () {
        $rootScope.$user = null;
        $rootScope.$countOfActions = '';
        window.localStorage.removeItem('authToken');
        window.localStorage.removeItem('authUser');
    };
    /**
     КІНЕЦЬ БЛОКУ ВХОДУ/ВИХОДУ
     **/

    /**
     БЛОК МАНІПУЛЯЦЇ ДАНИМИ КОРИСТУВАЧА
     **/ 
    //ЗБЕРЕЖЕННЯ ДАНИХ КОРИСТУВАЧА
    //Реєстрація користувача
    $scope.registerUser = function () {
        if(!$scope.validateRegistrationForm()){
            return;
        }
        var params =  {
            login: $scope.user.login,
            password: $scope.user.password,
            firstName: $scope.user.firstName,
            secondName: $scope.user.secondName,
            organization: $scope.user.organization,
            userID: -1
        };
        AuthModel.save(params, function(res){
            console.log(res);
            $scope.login();
        }, function (err) {
            console.log("Помилка при реєстрації!");
            console.log(err);
            showMessageWindow("alert alert-danger", "Користувача не зареєстровано!", "Не вдалося зареєструвати користувача.");
        });
    };
    //Оновлення даних користувача
    $scope.saveUserInfo = function () {
        if(!$scope.validateEditForm()){
            return;
        }
        var params =  {
            login: $rootScope.$user.login,
            password: $scope.user.password,
            firstName: $scope.user.firstName,
            secondName: $scope.user.secondName,
            organization: $scope.user.organization,
            userID: $rootScope.$user.id,
            changePassword: $scope.changePassword
        };
        AuthModel.save(params, function(res){
            console.log("Дані про користувача оновлено!");
            console.log(res);
            showMessageWindow("alert alert-success", "Дані користувача оновлено!", "Дію успішно виконано. Ваші дані оновлено.");

            $rootScope.$user.firstName = $scope.user.firstName;
            $rootScope.$user.secondName = $scope.user.secondName;
            $rootScope.$user.organization = $scope.user.organization;
            window.localStorage.setItem('authUser', JSON.stringify($rootScope.$user));
        }, function (err) {
            console.log("Дані про користувача не оновлено!");
            console.log(err);
            showMessageWindow("alert alert-danger", "Дані користувача не оновлено!", "Не вдалося оновити Ваші дані.");
        });
    };

    //Видалення користувача
    $scope.removeUser = function () {
        var answer = confirm("Ви дійсно бажаєте видалити користувача?\nУсі Ваші компетенції, групи, індикатори, дії не будуть видалені.");
        if (answer === true) {
            var params = $rootScope.$user.id;
            AuthModel.delete({id: params}, function (res) {
                console.log("Користувача видалено!");
                console.log(res);
                alert("Користувача видалено!");
                $scope.logout();
                $location.path("/main");
            }, function (err) {
                console.log("Користувача не видалено!!");
                console.log(err);
                showMessageWindow("alert alert-danger", "Користувача не видалено!", "Не вдалося видалити користувача.");
            });
        }
    };

    //РОБОТА З ДІЯМИ
    //Встановлення першої дії для відображення в списку
    //Очищення списку дій
    $rootScope.setFirstActionIDForUser = function (firstActionID) {
        var answer = confirm("Ви дійсно бажаєте видалити дії?\nУсі Ваші попередні дії стануть недоступними для інших користувачів.");
        if (answer === true) {
            if (firstActionID) {
                var params = {
                    userID: $rootScope.$user.id,
                    firstActionID: firstActionID
                };
                AuthModel.save(params, function (res) {
                    console.log('Початкову дію встановлено');
                    console.log(res);
                    $rootScope.$user.firstActionID = firstActionID;
                    window.localStorage.setItem('authUser', JSON.stringify($rootScope.$user));
                    $rootScope.getAllActions();
                }, function (err) {
                    console.log('Початкову дію не встановлено');
                    console.log(err);
                });
            }
        }
    };

    //Встановлення останньої переглянутої дії
    $rootScope.setLastActionIDForUser = function (lastActionID) {
        if(lastActionID) {
            var params = {
                userID: $rootScope.$user.id,
                lastActionID: lastActionID
            };
            AuthModel.save(params, function (res) {
                console.log('Останню дію встановлено');
                console.log(res);
            }, function (err) {
                console.log('Останню дію не встановлено');
                console.log(err);
            });
        }
    };
    /**
     КІНЕЦЬ БЛОКУ МАНІПУЛЯЦЇ ДАНИМИ КОРИСТУВАЧА
     **/

    /**
     БЛОК ВАЛІДАЦІЇ ФОРМ
     **/
    //Валідація ел.-пошти (логіну)
    $scope.checkEmailAdress = function () {
        var pattern = /^[a-z0-9_-]+@[a-z0-9-]+\.([a-z]{1,6}\.)?[a-z]{2,6}$/i;
        if (!$scope.user.login || $scope.user.login.search(pattern) != 0) {
            showMessageWindow("alert alert-danger", "Увага!", "Невірний формат електронної пошти!");
            return false;
        }		
        else{
            return true;
        }
    };

    //Валідація паролю
    $scope.checkPassword = function () {
        var pattern = /^[a-z0-9_-]/i;

        if(!$scope.user.password || $scope.user.password.length < 8) {
            showMessageWindow("alert alert-danger", "Увага!", "Довжина пароля має бути не менше 8 символів!");
            return false;
        }
        else if ($scope.user.password.search(pattern) != 0) {
            showMessageWindow("alert alert-danger", "Увага!", "Пароль має невірний формат!");
            return false;
        }
        else if($scope.user.password != $scope.user.confirmPassword){
            showMessageWindow("alert alert-danger", "Увага!", "Вміст полів 'Пароль' і 'Повторіть пароль' не співпадають!");
            return false;
        }
        return true;
    };

    //Валідація старого паролю
    $scope.checkOldPassword = function () {
        var params =  {
            login: $rootScope.$user.login,
            password: $scope.user.oldPassword
        };
		AuthModel.get({'id':JSON.stringify(params)}, function (res) {
            res = res.toJSON();
            console.log('res', res);
        }, function (err) {
            console.log('err', err.data);
            showMessageWindow("alert alert-danger", "Увага!", "Не вірний старий пароль!");
            return false;
        });
        return true;
    };

    //Валідація форми реєстрації
    $scope.validateRegistrationForm = function () {
        if(!$scope.checkEmailAdress()){
            return false;
        }
		else{
			//Перевірка, чи існує даний користувач в БД (логін)
			var result = false;
			var params = {
				login: $scope.user.login
			};
			AuthModel.get({'id': JSON.stringify(params)}, function (res) {
				if (res.data === undefined) {
					console.log('Не вдалося перевірити логін на існування! (res.data === undefined)');
					showMessageWindow("alert alert-danger", "Увага!", "Не вдалося перевірити логін на існування!");
				}
				else {
					if(Number(res.data) != 0){ //кількість користувачів з тиким логіном не 0
						showMessageWindow("alert alert-danger", "Увага!", "Користувач з даним логіном існує!");
					}
					else{
						result = true;
					}
				}
			}, function (err) {
				console.log("Не вдалося перевірити логін на існування!");
				showMessageWindow("alert alert-danger", "Увага!", "Не вдалося перевірити логін на існування!");
			});
			
			if(!result){
				return false;
			}
		}
		
        if(!$scope.checkPassword()){
            return false;
        }
        else if(!$scope.user.firstName){
            showMessageWindow("alert alert-danger", "Увага!", "Поле імені не має бути порожнім!");
            return false;
        }
        else if(!$scope.user.secondName){
            showMessageWindow("alert alert-danger", "Увага!", "Поле прізвища не має бути порожнім!");
            return false;
        }
        return true;
    };

    //Валідація форми редагування даних користувача
    $scope.validateEditForm = function () {
        if($scope.changePassword) {
            if (!$scope.checkOldPassword()) {
                return false;
            }
            else if (!$scope.checkPassword()) {
                return false;
            }
        }

        if(!$scope.user.firstName){
            showMessageWindow("alert alert-danger", "Увага!", "Поле імені не має бути порожнім!");
            return false;
        }
        else if(!$scope.user.secondName){
            showMessageWindow("alert alert-danger", "Увага!", "Поле прізвища не має бути порожнім!");
            return false;
        }
        return true;
    };
    /**
     КІНЕЦЬ БЛОКУ ВАЛІДАЦІЇ ФОРМ
     **/
}]);
