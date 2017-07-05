mainApp.controller('SkillsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'SkillsModel', function ($scope, $rootScope, $http, $location, $routeParams, SkillsModel) {
    $scope.data = null;
    $scope.nameText = "";
    $scope.groupText = "";
    $scope.descriptionText = "";

    $scope.getCurrentSkillIdSkillCtrl = function () {
        return $routeParams.id;
    };

    $scope.show = false;
    $scope.onClickSelectCurrentGroup = function(flag){
        if(flag){
            return "Обрати групу";
        }
        else {
            if($rootScope.$currentGroup!=null) {
                $scope.groupText = $rootScope.$currentGroup.skill_name;
            }
            return "Обрати групу з дерева";
        }
    };

    $rootScope.getAllSkills = function () {

        var params =  {
            skillId: 'ALL_SKILLS',
        };

        SkillsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET ALL SKILLS');
            }
            else {
                $scope.data = res.data.rows;
            }
        });
    };

    $rootScope.getSkillsByGroup = function (left_key, right_key) {
        var params =  {
            skillId: 'BY_GROUP',
            left_key: left_key,
            right_key: right_key,
        };

        SkillsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET SKILLS BY GROUP');
            }
            else {
                $scope.data = res.data.rows;
            }
        });
    };

    $rootScope.getSkill = function (skillId) {

        var params =  {
            skillId: skillId
        };

        SkillsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET SKILL');
            }
            else {
                $scope.data = res.data;
                $scope.nameText = res.data[0].skill_name;
                $rootScope.currentGroup = $rootScope.getCurrentGroup($scope.data[0].left_key,
                    $scope.data[0].right_key, $scope.data[0].node_level);
                if($rootScope.currentGroup != null) {
                    $scope.groupText = $rootScope.currentGroup.skill_name;
                }
                $scope.descriptionText = res.data[0].description;
            }
        });
    };

    $rootScope.getSkillName = function (skillId) {
        var params =  {
            skillId: skillId
        };

        SkillsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET SKILL');
            }
            else {
                $scope.data = res.data;
                console.log($scope.data);
            }
        });
    };

    $scope.saveSkill = function(nameValue, groupRightKeyValue, groupLevelValue, descriptionValue, skillId, userId){

        var value =  {
            skillId: skillId,
            skillName: nameValue,
            groupRightKey: groupRightKeyValue,
            groupLevel: groupLevelValue,
            skillDescription: descriptionValue,
            userId: userId
        };

        SkillsModel.save(value, function(res){
            console.log(res);
        });

        alert("Компетенцію збережено!");

        $rootScope.getAllSkills();
    };

    $scope.removeSkill = function(skillId){

        var params = skillId;

        var answer = confirm("Ви дійсно бажаєте видалити компетенцію? ");
        if (answer === true) {
            SkillsModel.delete({id:params}, function (res) {
                console.log(res);
                $rootScope.getAllSkills();
            });
            alert('Компетенцію видалено!');

        }
    };

    $scope.removeIndicatorFromList = function (i) {
        $scope.data[0].indicators.splice(i, 1);
    };

}]);