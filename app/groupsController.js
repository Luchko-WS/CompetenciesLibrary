
mainApp.controller('GroupsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'GroupsModel',
    function ($scope, $rootScope, $http, $location, $routeParams, GroupsModel) {

    //Init group data values block
    //begin
    $scope.data = null;
    $scope.nameText = null;
    $scope.groupText = null;
    $scope.descriptionText = null;
    $scope.oldGroupID = null;
    //end

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
    $scope.onClickSelectCurrentGroup = function(isHide){
        if(isHide){
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

    //Get routeParams block
    //begin
    $scope.getCurrentGroupId = function () {
        return $routeParams.id;
    };
    $scope.getSelectGroupID = function () {
        if($rootScope.$currentGroup!=null){
            return $rootScope.$currentGroup.id;
        }
    };
    //end

    ///////////////////////////////////
    //GET AND FORMAT TREE BLOCK
    ///////////////////////////////////
    $rootScope.getGroupTree = function () {
        var params =  {
            skill: 'NONE',
            indicator: 'NONE',
            exportToFile: 'NONE',
            tree: 'GROUPS'
        };
        GroupsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET GROUP TREE');
            }
            else {
                $rootScope.$tree = res.data;
                $('#tree').treeview({data: $rootScope.formatDataToTree()});
                $('#tree').on('nodeSelected', function(event, data) {
                    $rootScope.$currentGroup = data;
                    if(data.node_level == 1) {
                        $('#editItemButton').hide();
                    }
                    else{
                        $('#editItemButton').show();
                    }

                });
                $("#toggleButton").click(function () {
                    $("#toggleBox").slideToggle("normal");
                });
            }
        });
    };

    $rootScope.formatDataToTree = function() {
        var root = $rootScope.$tree[0];
        root.text = $rootScope.$tree[0].skill_name;
        root.node_id = 0;
        var stack = [0];
        var currentLevel = 2;

        for(var i = 1; i < $rootScope.$tree.length; i++) {
            $rootScope.$tree[i].node_id = i;
            $rootScope.$tree[i].nodes = null;
            $rootScope.$tree[i].text = $rootScope.$tree[i].skill_name;

            if(currentLevel == $rootScope.$tree[i].node_level){
                $rootScope.$tree[i].parentId = stack[0];
            }
            else if(currentLevel < $rootScope.$tree[i].node_level){
                stack.unshift($rootScope.$tree[i-1].node_id);
                $rootScope.$tree[i].parentId = stack[0];
                currentLevel++;
            }
            else if(currentLevel > $rootScope.$tree[i].node_level) {
                for(j = 0; j < currentLevel - $rootScope.$tree[i].node_level; j++) {
                    stack.shift();
                }
                $rootScope.$tree[i].parentId = stack[0];
                currentLevel -= (currentLevel - $rootScope.$tree[i].node_level);
            }
        }

        var map = {}, node, roots = [];
        for (var i = 1; i < $rootScope.$tree.length; i++) {
            node = $rootScope.$tree[i];
            node.nodes = null;
            map[node.node_id] = i;
            if (node.parentId !== 0) {
                if($rootScope.$tree[map[node.parentId]].nodes == null) {
                    $rootScope.$tree[map[node.parentId]].nodes = [];
                }
                $rootScope.$tree[map[node.parentId]].nodes.push(node);
            } else {
                roots.push(node);
            }
        }
        root.nodes = roots;
        return [root];
    };

    $rootScope.getCurrentGroup = function (left_key, right_key, level) {
        if($scope.$tree != null) {
            for (var i = 0; i < $rootScope.$tree.length; i++) {
                if (Number($rootScope.$tree[i].node_level) == (level - 1) &&
                    Number($rootScope.$tree[i].left_key) < left_key && Number($rootScope.$tree[i].right_key) > right_key) {
                    return $rootScope.$tree[i];
                }
            }
        }
    };
    ///////////////////////////////////
    //END GET AND FORMAT TREE BLOCK
    ///////////////////////////////////

    ////////////////////////
    //MANIPULATE GROUP DATA BLOCK
    ////////////////////////
    //Get group data
    //begin
    $scope.getGroup = function (groupId, setDataIntoForm) {
        $scope.oldGroupID = null;
        $scope.data = null;
        $rootScope.$currentGroup = null;
        var params =  {
            tree: false,
            groupId: groupId
        };
        GroupsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log(res);
                console.log("Помилка при отриманні групи!");
                $scope.data = -1;
            }
            else {
                $scope.data = res.data;
                if(setDataIntoForm) {
                    $scope.nameText = $scope.data[0].skill_name;
                    $rootScope.$currentGroup = $rootScope.getCurrentGroup($scope.data[0].left_key,
                        $scope.data[0].right_key, $scope.data[0].node_level);
                    if ($rootScope.$currentGroup) {
                        $scope.oldGroupID = $rootScope.$currentGroup.id;
                        $scope.groupText = $rootScope.$currentGroup.skill_name;
                    }
                    $scope.descriptionText = $scope.data[0].description;
                }
            }
        }, function (res) {
            console.log(res);
            console.log("Помилка при отриманні групи!");
            $scope.data = -1;
        });
    };

    $scope.prepareGroupToCreate = function (groupName, groupDescription, parentGroupID, parentGroupUserID, currentUserID) {
        if (!parentGroupID || !groupName) {
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Заповніть поля назви і групи!";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
            return;
        }
        if (currentUserID != parentGroupUserID && parentGroupID != 1) {
            $rootScope.saveAction('create', 'group', -1, groupName, null, groupDescription, parentGroupID, currentUserID);
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Дану дію додано до списку.";
            $scope.messageBoxClass = "alert alert-info";
            $('#messageBox').fadeIn("slow");
            return;
        }
        $scope.createGroup(groupName, parentGroupID, groupDescription, currentUserID);
    };

    $scope.createGroup = function(groupName, parentGroupID, groupDescription, userID){
        var params =  {
            groupName: groupName,
            parentGroupID: parentGroupID,
            groupDescription: groupDescription,
            userID: userID
        };
        GroupsModel.create(params, function(res){
            console.log(res);
            console.log("Групу створено!");
            $scope.messageTitleText = "Групу створено!";
            $scope.messageText = "Дію успішно виконано. Групу створено.";
            $scope.messageBoxClass = "alert alert-success";
            $('#messageBox').fadeIn("slow");
        },function (res) {
            console.log(res);
            console.log("Групу не створено!");
            $scope.messageTitleText = "Помилка!";
            $scope.messageText = "Не вдалося створити групу.";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
        });
    };

    $rootScope.prepareGroupToCopy = function (groupID, groupName, groupDescription, parentGroupID, parentGroupUserID, currentUserID) {
        if (currentUserID != parentGroupUserID) {
            $rootScope.saveAction('copy', 'group', groupID, groupName, null, groupDescription, parentGroupID, currentUserID);
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Дану дію додано до списку.";
            $scope.messageBoxClass = "alert alert-info";
            $('#messageBox').fadeIn("slow");
            return;
        }
        $scope.copyGroup(groupID, groupName, parentGroupID, groupDescription, currentUserID, 1);
    };

    $scope.copyGroup = function(groupID, groupName, parentGroupID, descriptionValue, userID, reloadEditView){
        var params =  {
            groupID: groupID,
            groupName: groupName,
            parentGroupID: parentGroupID,
            groupDescription: descriptionValue,
            isCopy: true,
            userID: userID
        };
        GroupsModel.create(params, function(res){
            console.log(res);
            console.log("Групу скопійовано!");
            $scope.messageTitleText = "Групу скопійовано!";
            $scope.messageText = "Дію успішно виконано. Групу скопійовано.";
            $scope.messageBoxClass = "alert alert-success";
            $('#messageBox').fadeIn("slow");
        },function (res) {
            console.log(res);
            console.log("Групу не скопійовано!!");
            $scope.messageTitleText = "Помилка!";
            $scope.messageText = "Не вдалося скопіювати групу.";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
        });
        if(reloadEditView) {
            $rootScope.getTree();
        }
    };

    $scope.prepareGroupToUpdate = function (groupID, groupName, newGroupName, newGroupDescription, newParentGroupID, userID, currentUserID) {
        var isMove = false;
        if (newParentGroupID != $scope.oldGroupID) {
            isMove = true;
            if ($scope.data != null && $rootScope.$currentGroup != null) {
                if (Number($rootScope.$currentGroup.left_key) >= Number($scope.data[0].left_key) && ($rootScope.$currentGroup.right_key <= $scope.data[0].right_key)) {
                    isMove = false;
                    $scope.messageTitleText = "Увага!";
                    $scope.messageText = "Не можливо перемістити дану групу в підлеглу їй групу!";
                    $scope.messageBoxClass = "alert alert-danger";
                    $('#messageBox').fadeIn("slow");
                    return;
                }
            }
        }
        if (userID != currentUserID) {
            $rootScope.saveAction('edit', 'group', groupID, groupName, newGroupName, newGroupDescription, newParentGroupID, currentUserID);
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Дану дію додано до списку.";
            $scope.messageBoxClass = "alert alert-info";
            $('#messageBox').fadeIn("slow");
            return;
        }
        $scope.updateGroup(newGroupName, newParentGroupID, newGroupDescription, groupID, isMove);
    };

    $rootScope.prepareGroupToMove = function (groupID, groupName, newGroupName, newGroupDescription, newParentGroupID, userID, currentUserID) {
        if (userID != currentUserID) {
            $rootScope.saveAction('edit', 'group', groupID, groupName, newGroupName, newGroupDescription, newParentGroupID, currentUserID);
            $scope.messageTitleText = "Увага!";
            $scope.messageText = "Дану дію додано до списку.";
            $scope.messageBoxClass = "alert alert-info";
            $('#messageBox').fadeIn("slow");
            return;
        }
        $scope.updateGroup(newGroupName, newParentGroupID, newGroupDescription, groupID, 1, 1);
    };

    $scope.updateGroup = function(groupName, parentGroupID, descriptionValue, groupID, isMove, reloadEditView){
        var params =  {
            groupID: groupID,
            groupName: groupName,
            parentGroupID: parentGroupID,
            groupDescription: descriptionValue,
            isMove: isMove
        };
        GroupsModel.update({'id':JSON.stringify(params)}, function(res){
            console.log(res);
            console.log("Групу оновлено!");
            $scope.messageTitleText = "Групу оновлено!";
            $scope.messageText = "Дію успішно виконано. Групу оновлено.";
            $scope.messageBoxClass = "alert alert-success";
            $('#messageBox').fadeIn("slow");
        }, function(res){
            console.log(res);
            console.log("Групу не оновлено!!");
            $scope.messageTitleText = "Помилка!";
            $scope.messageText = "Не вдалося оновити групу.";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
        });

        if(reloadEditView){
            $rootScope.getTree();
        }
    };

    $scope.prepareGroupToRemove = function (groupID, groupName, parentGroupID, userID, currentUserID, reloadEditView) {
        if (userID != currentUserID) {
            var answer = confirm("Ви дійсно бажаєте видалити групу? ");
            if (answer === true) {
                $rootScope.saveAction('remove', 'group', groupID, groupName, null, null, parentGroupID, currentUserID);;
                $scope.groupCtrlMessageTitleText = "Увага!";
                $scope.groupCtrlMessageText = "Дану дію додано до списку.";
                $scope.messageBoxClass = "alert alert-info";
                $('#messageBox').fadeIn("slow");
            }
            return;
        }
        $scope.removeGroup(groupID, reloadEditView);
    };

    $scope.removeGroup = function(groupID, reloadEditView){
        var params = groupID;
        GroupsModel.delete({id:params}, function (res) {
            console.log(res);
            console.log("Групу видалено!");
            $scope.messageTitleText = "Групу видалено!";
            $scope.messageText = "Дію успішно виконано. Групу видалено.";
            $scope.messageBoxClass = "alert alert-success";
            $('#messageBox').fadeIn("slow");

            if(reloadEditView){
                $rootScope.getTree();
            }
            else {
                $rootScope.getAllSkills();
                $rootScope.getGroupTree();
            }
        }, function (res){
            console.log(res);
            console.log("Групу не видалено!!");
            $scope.messageTitleText = "Помилка!";
            $scope.messageText = "Не вдалося видалити групу.";
            $scope.messageBoxClass = "alert alert-danger";
            $('#messageBox').fadeIn("slow");
        });
    };
}]);