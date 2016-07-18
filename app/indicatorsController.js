mainApp.controller('IndicatorsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'IndicatorsModel',
    function ($scope, $rootScope, $http, $location, $routeParams, IndicatorsModel) {

    $scope.indicatorData = null;
    $scope.nameText = null;
    $scope.descriptionText = null;

    $scope.getCurrentSkillIdIndicatorCtrl = function () {
        return $routeParams.skillId;
    };

    $scope.getCurrentIndicatorId = function () {
        return $routeParams.id;
    };

    $scope.getIndicator = function (indicatorId, setDataIntoForm) {
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
                $scope.indicatorData = res.data;

                if(setDataIntoForm) {
                    $scope.nameText = $scope.indicatorData[0].indicator_name;
                    $scope.descriptionText = $scope.indicatorData[0].description;

                    if($scope.getCurrentSkillIdIndicatorCtrl() != $scope.indicatorData[0].skill_id){
                        $scope.indicatorData = null;
                    }
                }
            }
        })
    };

    $scope.prepareIndicatorToCreate = function (indicatorName, indicatorDescription, parentSkillID, skillUserID, currentUserID) {
        if(!indicatorName){
            alert("Заповніть поле назви!");
            return;
        }

        if (currentUserID != skillUserID) {
            $rootScope.saveAction('create', 'indicator', -1, indicatorName, null, indicatorDescription, parentSkillID, currentUserID);
            alert('Дану дію додано до списку!');
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
            $rootScope.getSkill(skillIDValue, 1);
        });
        alert("Індикатор збережено!");
    };

    $scope.prepareIndicatorToUpdate = function (indicatorID, indicatorName, newIndicatorName, newIndicatorDescription, newParentSkillID, userID, currentUserID) {
        if(!indicatorName){
            alert("Заповніть поле назви!");
            return;
        }

        if (userID != currentUserID) {
            $rootScope.saveAction('edit', 'indicator', indicatorID, indicatorName, newIndicatorName, newIndicatorDescription, newParentSkillID, currentUserID);
            alert('Дану дію додано до списку!');
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
        });
        alert("Індикатор збережено!");
    };

    $scope.prepareIndicatorToRemove = function (indicatorID, indicatorName, parentSkillID, userID, currentUserID) {
        if (userID != currentUserID) {
            $rootScope.saveAction('remove', 'indicator', indicatorID, indicatorName, null, null, parentSkillID, currentUserID);
            alert('Дану дію додано до списку!');
            return;
        }
        $scope.removeIndicator(indicatorID, parentSkillID);
    };

    $scope.removeIndicator = function(indicatorId, skillID){
        var params = indicatorId;
        var answer = confirm("Ви дійсно бажаєте видалити індикатор? ");
        if (answer === true) {
            IndicatorsModel.delete({id:params}, function (res) {
                console.log(res);
                if(skillID) {
                    $rootScope.getSkill(skillID, 1);
                }
            });
            alert('Індикатор видалено!');
        }
    };
}]);