mainApp.controller('IndicatorsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'IndicatorsModel',
    function ($scope, $rootScope, $http, $location, $routeParams, IndicatorsModel) {

    //Змінна даних індикатору
    $scope.indicatorData = null;
    //Змінні форми (моделі)
    $scope.nameText = null;
    $scope.descriptionText = null;

    /**
    БЛОК РОБОТИ З ПАРАМЕТРАМИ АДРЕСНОГО РЯДКА
     **/
    $scope.getRouteParamSkillID_IndicatorCtrl = function () {
        return $routeParams.skillID;
    };
    $scope.getRouteParamIndicatorID_IndicatorCtrl = function () {
        return $routeParams.id;
    };
    /**
    КІНЕЦЬ БЛОКУ РОБОТИ З ПАРАМЕТРАМИ АДРЕСНОГО РЯДКА
    **/

    ///////////////////////////////////
    //БЛОК ІНТЕРФЕЙСУ
    ///////////////////////////////////
    //ПОВІДОМЛЕННЯ
    $scope.messageBoxClass = null;
    $scope.messageTitleText = null;
    $scope.messageText = null;
    //Виведення повідомлення
    function showMessageWindow(messageClass, messageTittle, messageBody) {
        $scope.messageTitleText = messageTittle;
        $scope.messageText = messageBody;
        $scope.messageBoxClass = messageClass;
        $('#indicatorMessageBox').fadeIn("slow");
    }
    //Кнопка закриття повідомлення
    $("#closeIndicatorMessageBoxButton").click(function () {
        $('#indicatorMessageBox').fadeOut("slow");
    });
    /**
    КІНЕЦЬ БЛОКУ ІНТЕРФЕЙСУ
    **/

    /**
    БЛОК МАНІПУЛЯЦІЇ ІНДИКАТОРАМИ
    **/
    //Отримання індикатору
    $scope.getIndicator = function (indicatorID, setDataIntoForm) {
        $scope.indicatorData = null;
        var params =  {
            indicatorID: indicatorID
        };
        IndicatorsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('Не вдалося отримати індикатор! (res.data === undefined)');
                $scope.indicatorData = -1;
            }
            else {
                if(res.data[0].skill_id != $routeParams.skillId && $routeParams.skillId != undefined){
                    console.log('Не вдалося отримати індикатор! (res.data[0].skill_id != $routeParams.skillId)');
                    $scope.indicatorData = -1;
                }
                else {
                    $scope.indicatorData = res.data;
                    if (setDataIntoForm) {
                        $scope.nameText = $scope.indicatorData[0].name;
                        $scope.descriptionText = $scope.indicatorData[0].description;
                    }
                }
            }
        }, function (err) {
            console.log('Не вдалося отримати індикатор!');
            console.log(err);
        });
    };

    //СТВОРЕННЯ ІНДИКАТОРУ
    //Підготовка до створення індикатору
    $scope.prepareIndicatorToCreate = function (indicatorName, indicatorDescription, parentSkillID, skillUserID, currentUserID) {
        if(!indicatorName){
            showMessageWindow("alert alert-danger", "Увага!", "Заповніть поле назви!");
            return;
        }
        if (currentUserID != skillUserID) {
            $rootScope.saveAction('create', 'indicator', -1, indicatorName, null, indicatorDescription, parentSkillID, currentUserID);
            showMessageWindow("alert alert-info", "Увага!", "Дану дію додано до списку.");
            return;
        }
        $scope.createIndicator(indicatorName, parentSkillID, indicatorDescription, currentUserID);
    };

    //Створення індикатору
    $scope.createIndicator = function(indicatorName, skillID, indicatorDescription, userID){
        var params =  {
            indicatorName: indicatorName,
            indicatorDescription: indicatorDescription,
            skillID: skillID,
            userID: userID
        };
        IndicatorsModel.create(params, function(res){
            console.log("Індикатор створено!");
            console.log(res);
            showMessageWindow("alert alert-success", "Увага!", "Дію успішно виконано. Індикатор створено.");
        }, function (err) {
            console.log("Індикатор не створено!");
            console.log(err);
            showMessageWindow("alert alert-danger", "Помилка!", "Не вдалося створити індикатор.");
        });
    };

    //РЕДАГУВАННЯ ІНДИКАТОРУ
    //Підготовка індикатору до оновлення
    $scope.prepareIndicatorToUpdate = function (indicatorID, indicatorName, newIndicatorName, newIndicatorDescription, newParentSkillID, userID, currentUserID) {
        if(!indicatorName){
            showMessageWindow("alert alert-danger", "Увага!", "Заповніть поле назви!");
            return;
        }
        if (userID != currentUserID) {
            $rootScope.saveAction('edit', 'indicator', indicatorID, indicatorName, newIndicatorName, newIndicatorDescription, newParentSkillID, currentUserID);
            showMessageWindow("alert alert-info", "Увага!", "Дану дію додано до списку.");
            return;
        }
        $scope.updateIndicator(indicatorID, newIndicatorName, newParentSkillID, newIndicatorDescription);
    };

    //Оновлення індикатору
    $scope.updateIndicator = function(indicatorID, indicatorName, skillID, descriptionValue){
        var params =  {
            indicatorID: indicatorID,
            indicatorName: indicatorName,
            indicatorDescription: descriptionValue,
            skillID: skillID
        };
        IndicatorsModel.update({'id':JSON.stringify(params)}, function(res){
            console.log(res);
            console.log("Індикатор оновлено!");
            showMessageWindow("alert alert-success", "Увага!", "Дію успішно виконано. Індикатор оновлено.");
        }, function (err) {
            console.log(err);
            console.log("Індикатор не оновлено!");
            showMessageWindow("alert alert-danger", "Помилка!", "Не вдалося оновити індикатор.");
        });
    };

    //ВИДАЛЕННЯ ІНДИКАТОРУ
    //Підготовка до видалення індикатору
    $scope.prepareIndicatorToRemove = function (indicatorID, indicatorName, parentSkillID, userID, currentUserID) {
        var answer = confirm("Ви дійсно бажаєте видалити індикатор? ");
        if (answer === true) {
            if (userID != currentUserID) {
                $rootScope.saveAction('remove', 'indicator', indicatorID, indicatorName, null, null, parentSkillID, currentUserID);
                showMessageWindow("alert alert-info", "Увага!", "Дану дію додано до списку.");
                return;
            }
            $scope.removeIndicator(indicatorID, parentSkillID);
        }
    };

    //Видалення індикатору
    $scope.removeIndicator = function(indicatorID, skillID){
        var params = indicatorID;
        IndicatorsModel.delete({id:params}, function (res) {
            console.log("Індикатор видалено!");
            console.log(res);
            if(skillID) {
                $rootScope.getSkill(skillID, 1);
            }
        }, function (err) {
            console.log("Індикатор не видалено!");
            console.log(err);
            showMessageWindow("alert alert-danger", "Помилка!", "Не вдалося видалити індикатор.");
        });
    };
    /**
     КІНЕЦЬ БЛОКУ МАНІПУЛЯЦІЇ ІНДИКАТОРАМИ
     **/
}]);