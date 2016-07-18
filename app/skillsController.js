mainApp.controller('SkillsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'SkillsModel',
    function ($scope, $rootScope, $http, $location, $routeParams, SkillsModel) {

    $scope.data = null;
    $scope.nameText = null;
    $scope.groupText = null;
    $scope.descriptionText = null;
    $scope.oldGroupID = null;

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
        $scope.data = null;
        $rootScope.$currentGroup = null;

        var params =  {
            skillID: 'ALL_SKILLS',
        };
        SkillsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET ALL SKILLS');
                $scope.data = -1;
            }
            else {
                $scope.data = res.data.rows;
            }
        });
    };

    $rootScope.getSkillsByGroup = function (left_key, right_key) {
        $scope.data = null;
        $rootScope.$currentGroup = null;

        var params =  {
            skillID: 'BY_GROUP',
            left_key: left_key,
            right_key: right_key,
        };
        SkillsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET SKILLS BY GROUP');
                $scope.data = -1;
            }
            else {
                $scope.data = res.data.rows;
            }
        });
    };

    $rootScope.getSkill = function (skillID, setDataIntoForm) {
        $scope.data = null;
        $rootScope.$currentGroup = null;
        $scope.oldGroupID = null;

        var params =  {
            skillID: skillID
        };
        SkillsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET SKILL');
                $scope.data = -1;
            }
            else {
                $scope.data = res.data;
                if(setDataIntoForm) {
                    $scope.nameText = $scope.data[0].skill_name;
                    $rootScope.$currentGroup = $rootScope.getCurrentGroup($scope.data[0].left_key,
                        $scope.data[0].right_key, $scope.data[0].node_level);
                    if ($rootScope.$currentGroup != null) {
                        $scope.groupText = $rootScope.$currentGroup.skill_name;
                        $scope.oldGroupID = $rootScope.$currentGroup.id;
                    }
                    $scope.descriptionText = $scope.data[0].description;
                }
            }
        });
    };

    $scope.prepareSkillToCreate = function (skillName, skillDescription, parentGroupID, parentGroupUserID, currentUserID) {
        if(!skillName || !parentGroupID){
            alert("Заповніть поля назви і групи!");
            return;
        }

        if (currentUserID != parentGroupUserID) {
            $rootScope.saveAction('create', 'skill', -1, skillName, null, skillDescription, parentGroupID, currentUserID);
            alert('Дану дію додано до списку!');
            return;
        }
        $scope.createSkill(skillName, parentGroupID, skillDescription, currentUserID);

    };

    $scope.createSkill = function(nameValue, groupID, descriptionValue, userID){
        var params =  {
            skillName: nameValue,
            groupID: groupID,
            skillDescription: descriptionValue,
            userID: userID,
        };

        SkillsModel.create(params, function(res){
            console.log(res);
        });
        alert("Компетенцію створено!");
        $rootScope.getAllSkills();
    };

    $scope.prepareSkillToUpdate = function (skillID, skillName, newSkillName, newSkillDescription, newParentGroupID, userID, currentUserID) {
        if(!skillName || !newParentGroupID){
            alert("Заповніть поля назви і групи!");
            return;
        }
        var isMove = false;
        if($scope.oldGroupID != newParentGroupID){
            isMove = true;
        }

        if (userID != currentUserID) {
            $rootScope.saveAction('edit', 'skill', skillID, skillName, newSkillName, newSkillDescription, newParentGroupID, currentUserID);
            alert('Дану дію додано до списку!');
            return;
        }
        $scope.updateSkill(newSkillName, newParentGroupID, newSkillDescription, skillID, isMove);
    };

    $scope.updateSkill = function(nameValue, groupID, descriptionValue, skillID, isMove){
        var params =  {
            skillID: skillID,
            skillName: nameValue,
            groupID: groupID,
            skillDescription: descriptionValue,
            isMove: isMove
        };

        SkillsModel.update({'id':JSON.stringify(params)}, function(res){
            console.log(res);
        });
        alert("Компетенцію оновлено!");
        $rootScope.getAllSkills();
    };

    $scope.prepareSkillToRemove = function (skillID, skillName, parentGroupID, userID, currentUserID) {
        if (userID != currentUserID) {
            $rootScope.saveAction('remove', 'skill', skillID, skillName, null, null, parentGroupID, currentUserID);
            alert('Дану дію додано до списку!');
            return;
        }
        $scope.removeSkill(skillID);
    };

    $scope.removeSkill = function(skillID){
        var params = skillID;
        var answer = confirm("Ви дійсно бажаєте видалити компетенцію? ");
        if (answer === true) {
            SkillsModel.delete({id: params}, function (res) {
                console.log(res);
                $rootScope.getAllSkills();
            });
            alert('Компетенцію видалено!');
        }
    };

    /*$scope.removeIndicatorFromList = function (i) {
        $scope.data[0].indicators.splice(i, 1);
    };*/

}]);