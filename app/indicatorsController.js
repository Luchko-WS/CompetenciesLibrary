mainApp.controller('IndicatorsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'IndicatorsModel', function ($scope, $rootScope, $http, $location, $routeParams, IndicatorsModel) {
    $scope.data = null;
    $scope.nameText = "";
    $scope.descriptionText = "";

    $scope.getCurrentSkillIdIndicatorCtrl = function () {
        return $routeParams.skillId;
    };

    $scope.getCurrentIndicatorId = function () {
        return $routeParams.id;
    };

    $scope.getIndicator = function (indicatorId) {
        var params =  {
            indicatorId: indicatorId
        };
        IndicatorsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET INDICATOR');
            }
            else {
                $scope.data = res.data;
                $scope.nameText = res.data[0].indicators[0].indicator_name;
                $scope.descriptionText = res.data[0].indicators[0].description;

                if($scope.getCurrentSkillIdIndicatorCtrl() != $scope.data[0].indicators[0].skill_id){
                    $scope.data = null;
                }
            }
        })
    };

    $scope.saveIndicator = function(nameValue, skillIdValue, descriptionValue, indicatorId, userId){
        var value =  {
            skillId: skillIdValue,
            indicatorName: nameValue,
            indicatorId: indicatorId,
            indicatorDescription: descriptionValue,
            userId: userId
        };
        IndicatorsModel.save(value, function(res){
            console.log(res);
        });
        alert("Індикатор збережено!");
    };

    $scope.removeIndicator = function(indicatorId){
        var params = indicatorId;
        var answer = confirm("Ви дійсно бажаєте видалити індикатор? ");
        if (answer === true) {
            IndicatorsModel.delete({id:params}, function (res) {
                console.log(res);
            });
            alert('Індикатор видалено!');
        }
    };

}]);