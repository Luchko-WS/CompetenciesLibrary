mainApp.controller('SkillsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'SkillsModel',
    function ($scope, $rootScope, $http, $location, $routeParams, SkillsModel) {

    $scope.data = null;
    $scope.nameText = null;
    $scope.groupText = null;
    $scope.descriptionText = null;
    $scope.oldGroupID = null;

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

    //Select node from tree
    //begin
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
    //end
    ///////////////////////////////////
    //END INTERFACE BLOCK
    ///////////////////////////////////

    $scope.getCurrentSkillIdSkillCtrl = function () {
        return $routeParams.id;
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
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Заповніть поля назви і групи!";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
            return;
        }

        if (currentUserID != parentGroupUserID) {
            $rootScope.saveAction('create', 'skill', -1, skillName, null, skillDescription, parentGroupID, currentUserID);
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Дану дію додано до списку.";
            $scope.messageBoxClass = "alert alert-info";
            $('#messageBox').fadeIn("slow");
            return;
        }
        $scope.createSkill(skillName, parentGroupID, skillDescription, currentUserID);

    };

    $scope.createSkill = function(nameValue, groupID, descriptionValue, userID){
        var params =  {
            skillName: nameValue,
            groupID: groupID,
            skillDescription: descriptionValue,
            userID: userID
        };
        SkillsModel.create(params, function(res){
            console.log(res);
            console.log("Компетенцію створено!");
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Дію успішно виконано. Компетенцію створено.";
            $scope.messageBoxClass = "alert alert-success";
            $('#messageBox').fadeIn("slow");
        }, function (res) {
            console.log(res);
            console.log("Компетенцію не створено!");
            $scope.messageTitleText = "Помилка!";
            $scope.messageText = "Не вдалося створити компетенцію.";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
        });
    };

    $rootScope.prepareSkillToCopy = function (skillID, skillName, skillDescription, parentGroupID, parentGroupUserID, currentUserID) {
        if (currentUserID != parentGroupUserID) {
            $rootScope.saveAction('copy', 'skill', skillID, skillName, null, skillDescription, parentGroupID, currentUserID);
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Дану дію додано до списку.";
            $scope.messageBoxClass = "alert alert-info";
            $('#messageBox').fadeIn("slow");
            return;
        }
        $scope.copySkill(skillID, skillName, parentGroupID, skillDescription, currentUserID, 1);

    };

    $scope.copySkill = function(skillID, nameValue, groupID, descriptionValue, userID, reloadEditView){
        var params =  {
            skillID: skillID,
            skillName: nameValue,
            groupID: groupID,
            skillDescription: descriptionValue,
            isCopy: true,
            userID: userID
        };
        SkillsModel.create(params, function(res){
            console.log(res);
            console.log("Компетенцію скопійовано!");
            $scope.messageTitleText = "Компетенцію скопійовано!";
            $scope.messageText = "Дію успішно виконано. Компетенцію скопійовано.";
            $scope.messageBoxClass = "alert alert-success";
            $('#messageBox').fadeIn("slow");
        }, function (res) {
            console.log(res);
            console.log("Компетенцію не скопійовано!!");
            $scope.messageTitleText = "Помилка!";
            $scope.messageText = "Не вдалося скопіювати компетенцію.";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
        });

        if(reloadEditView) {
            $rootScope.getTree();
        }
    };


    $scope.prepareSkillToUpdate = function (skillID, skillName, newSkillName, newSkillDescription, newParentGroupID, userID, currentUserID) {
        if(!skillName || !newParentGroupID){
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Заповніть поля назви і групи!";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
            return;
        }
        var isMove = false;
        if($scope.oldGroupID != newParentGroupID){
            isMove = true;
        }

        if (userID != currentUserID) {
            $rootScope.saveAction('edit', 'skill', skillID, skillName, newSkillName, newSkillDescription, newParentGroupID, currentUserID);
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Дану дію додано до списку.";
            $scope.messageBoxClass = "alert alert-info";
            $('#messageBox').fadeIn("slow");
            return;
        }
        $scope.updateSkill(newSkillName, newParentGroupID, newSkillDescription, skillID, isMove);
    };

    $rootScope.prepareSkillToMove = function (skillID, skillName, newSkillName, newSkillDescription, newParentGroupID, userID, currentUserID) {
        if (userID != currentUserID) {
            $rootScope.saveAction('edit', 'skill', skillID, skillName, newSkillName, newSkillDescription, newParentGroupID, currentUserID);
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Дану дію додано до списку.";
            $scope.messageBoxClass = "alert alert-info";
            $('#messageBox').fadeIn("slow");
            return;
        }
        $scope.updateSkill(newSkillName, newParentGroupID, newSkillDescription, skillID, 1, 1);
    };

    $scope.updateSkill = function(nameValue, groupID, descriptionValue, skillID, isMove, reloadEditView){
        var params =  {
            skillID: skillID,
            skillName: nameValue,
            groupID: groupID,
            skillDescription: descriptionValue,
            isMove: isMove
        };

        SkillsModel.update({'id':JSON.stringify(params)}, function(res){
            console.log(res);
            console.log("Компетенцію оновлено!");
            $scope.messageTitleText = "Компетенцію оновлено!";
            $scope.messageText = "Дію успішно виконано. Компетенцію оновлено.";
            $scope.messageBoxClass = "alert alert-success";
            $('#messageBox').fadeIn("slow");

            if(reloadEditView){
                $rootScope.getTree();
            }
        }, function (res) {
            console.log(res);
            console.log("Компетенцію не оновлено!");
            $scope.messageTitleText = "Помилка!";
            $scope.messageText = "Не вдалося оновити компетенцію.";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
        });
    };

    $scope.prepareSkillToRemove = function (skillID, skillName, parentGroupID, userID, currentUserID, reloadEditView) {
        if (userID != currentUserID) {
            var answer = confirm("Ви дійсно бажаєте видалити компетенцію? ");
            if (answer === true) {
                $rootScope.saveAction('remove', 'skill', skillID, skillName, null, null, parentGroupID, currentUserID);
                $scope.messageTitleText = "Увага!";
                $scope.messageText = "Дану дію додано до списку.";
                $scope.messageBoxClass = "alert alert-info";
                $('#messageBox').fadeIn("slow");
            }
            return;
        }
        $scope.removeSkill(skillID, reloadEditView);
    };

    $scope.removeSkill = function(skillID, reloadEditView){
        var params = skillID;
        SkillsModel.delete({id: params}, function (res) {
            console.log(res);
            console.log("Компетенцію видалено!");
            $scope.messageTitleText = "Компетенцію видалено!";
            $scope.messageText = "Дію успішно виконано. Компетенцію видалено.";
            $scope.messageBoxClass = "alert alert-success";
            $('#messageBox').fadeIn("slow");

            if(reloadEditView){
                $rootScope.getTree();
            }
            else {
                $rootScope.getAllSkills();
            }
        }, function (res) {
            console.log(res);
            console.log("Компетенцію не видалено!");
            $scope.messageTitleText = "Помилка!";
            $scope.messageText = "Не вдалося видалити компетенцію.";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
        });
    };

    $scope.skillFilter = function (obj) {
        if($scope.search) {
            if (obj.skill_name.toLowerCase().indexOf($scope.search.toLowerCase()) + 1) {
                return true;
            }
            if (obj.user.toLowerCase().indexOf($scope.search.toLowerCase()) + 1) {
                return true;
            }
            if (obj.path.toLowerCase().indexOf($scope.search.toLowerCase()) + 1) {
                return true;
            }
            for (i = 0; i < obj.indicators.length; i++) {
                if (obj.indicators[i].indicator_name.toLowerCase().indexOf($scope.search.toLowerCase()) + 1) {
                    return true;
                }
            }
            return false;
        }
        else{
            return true;
        }
    };

    /*$scope.removeIndicatorFromList = function (i) {
        $scope.data[0].indicators.splice(i, 1);
    };*/

}]);