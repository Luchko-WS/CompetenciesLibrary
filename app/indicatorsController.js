mainApp.controller('IndicatorsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'IndicatorsModel',
    function ($scope, $rootScope, $http, $location, $routeParams, IndicatorsModel) {

    $scope.indicatorData = null;
    $scope.nameText = null;
    $scope.descriptionText = null;

    //Message block
    //begin
    $scope.messageTitleText = null;
    $scope.messageText = null;
    $("#closeMessageBoxButton").click(function () {
        $('#messageBox').fadeOut("slow");
    });
    $scope.messageBoxClass = null;
    //end

    $scope.getCurrentSkillIdIndicatorCtrl = function () {
        return $routeParams.skillId;
    };

    $scope.getCurrentIndicatorId = function () {
        return $routeParams.id;
    };

    $scope.getIndicator = function (indicatorId, currentSkillID, setDataIntoForm) {
        $scope.indicatorData = null;
        var params =  {
            indicatorId: indicatorId
        };

        IndicatorsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET INDICATOR');
                $scope.indicatorData = -1;
            }
            else {
                if(res.data[0].skill_id != $routeParams.skillId && $routeParams.skillId != undefined){
                    console.log('ERROR IN GET INDICATOR');
                    $scope.indicatorData = -1;
                }
                else {
                    $scope.indicatorData = res.data;

                    if (setDataIntoForm) {
                        $scope.nameText = $scope.indicatorData[0].indicator_name;
                        $scope.descriptionText = $scope.indicatorData[0].description;

                        if ($scope.getCurrentSkillIdIndicatorCtrl() != $scope.indicatorData[0].skill_id) {
                            $scope.indicatorData = null;
                        }
                    }
                }
            }
        })
    };

    $scope.prepareIndicatorToCreate = function (indicatorName, indicatorDescription, parentSkillID, skillUserID, currentUserID) {
        if(!indicatorName){
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Заповніть поле назви!";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
            return;
        }
        if (currentUserID != skillUserID) {
            $rootScope.saveAction('create', 'indicator', -1, indicatorName, null, indicatorDescription, parentSkillID, currentUserID);
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Дану дію додано до списку.";
            $scope.messageBoxClass = "alert alert-info";
            $('#messageBox').fadeIn("slow");
            return;
        }
        $scope.createIndicator(indicatorName, parentSkillID, indicatorDescription, currentUserID);
    };

    $scope.createIndicator = function(nameValue, skillIDValue, descriptionValue, userId){
        var params =  {
            indicatorName: nameValue,
            indicatorDescription: descriptionValue,
            skillId: skillIDValue,
            userId: userId
        };
        IndicatorsModel.create(params, function(res){
            console.log(res);
            console.log("Індикатор створено!");
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Дію успішно виконано. Індикатор створено.";
            $scope.messageBoxClass = "alert alert-success";
            $('#messageBox').fadeIn("slow");
        }, function (res) {
            console.log(res);
            console.log("Індикатор не створено!");
            $scope.messageTitleText = "Помилка!";
            $scope.messageText = "Не вдалося створити індикатор.";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
        });
    };

    $scope.prepareIndicatorToUpdate = function (indicatorID, indicatorName, newIndicatorName, newIndicatorDescription, newParentSkillID, userID, currentUserID) {
        if(!indicatorName){
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Заповніть поле назви!";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
            return;
        }
        if (userID != currentUserID) {
            $rootScope.saveAction('edit', 'indicator', indicatorID, indicatorName, newIndicatorName, newIndicatorDescription, newParentSkillID, currentUserID);
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Дану дію додано до списку.";
            $scope.messageBoxClass = "alert alert-info";
            $('#messageBox').fadeIn("slow");
            return;
        }
        $scope.updateIndicator(newIndicatorName, newParentSkillID, newIndicatorDescription, indicatorID);
    };

    $scope.updateIndicator = function(nameValue, skillIdValue, descriptionValue, indicatorId){
        var params =  {
            indicatorId: indicatorId,
            indicatorName: nameValue,
            indicatorDescription: descriptionValue,
            skillId: skillIdValue
        };
        IndicatorsModel.update({'id':JSON.stringify(params)}, function(res){
            console.log(res);
            console.log("Індикатор оновлено!");
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Дію успішно виконано. Індикатор оновлено.";
            $scope.messageBoxClass = "alert alert-success";
            $('#messageBox').fadeIn("slow");
        }, function (res) {
            console.log(res);
            console.log("Індикатор не оновлено!");
            $scope.messageTitleText = "Помилка!";
            $scope.messageText = "Не вдалося оновити індикатор.";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
        });
    };

    $scope.prepareIndicatorToRemove = function (indicatorID, indicatorName, parentSkillID, userID, currentUserID) {
        if (userID != currentUserID) {
            var answer = confirm("Ви дійсно бажаєте видалити індикатор? ");
            if (answer === true) {
                $rootScope.saveAction('remove', 'indicator', indicatorID, indicatorName, null, null, parentSkillID, currentUserID);
                $scope.messageTitleText = "Увага!";
                $scope.messageText = "Дану дію додано до списку.";
                $scope.messageBoxClass = "alert alert-info";
                $('#messageBox').fadeIn("slow");
            }
            return;
        }
        $scope.removeIndicator(indicatorID, parentSkillID);
    };

    $scope.removeIndicator = function(indicatorId, skillID){
        var params = indicatorId;
        IndicatorsModel.delete({id:params}, function (res) {
            console.log(res);
            console.log("Індикатор видалено!");
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Дію успішно виконано. Індикатор видалено.";
            $scope.messageBoxClass = "alert alert-success";
            $('#messageBox').fadeIn("slow");
            if(skillID) {
                $rootScope.getSkill(skillID, 1);
            }
        }, function (res) {
            console.log(res);
            console.log("Індикатор не видалено!");
            $scope.messageTitleText = "Помилка!";
            $scope.messageText = "Не вдалося видалити індикатор.";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
        });
    };
}]);