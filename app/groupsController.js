mainApp.controller('GroupsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'GroupsModel',
    function ($scope, $rootScope, $http, $location, $routeParams, GroupsModel) {

    $scope.data = null;
    $scope.nameText = null;
    $scope.groupText = null;
    $scope.descriptionText = null;
    $scope.oldGroupID = null;

    $scope.getCurrentGroupId = function () {
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

    $scope.getSelectGroupID = function () {
        if($rootScope.$currentGroup!=null){
            return $rootScope.$currentGroup.id;
        }
    };

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
                console.log('ERROR IN GET GROUP');
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
        });
    };

    $scope.prepareGroupToCreate = function (groupName, groupDescription, parentGroupID, parentGroupUserID, currentUserID) {
        if (!parentGroupID || !groupName) {
            alert("Заповніть поля назви і групи!");
            return;
        }

        if (currentUserID != parentGroupUserID) {
            $rootScope.saveAction('create', 'group', -1, groupName, null, groupDescription, parentGroupID, currentUserID);
            alert('Дану дію додано до списку!');
            return;
        }
        $scope.createGroup(groupName, parentGroupID, groupDescription, currentUserID);

    };

    $scope.createGroup = function(nameValue, parentGroupID, descriptionValue, userID){
        var params =  {
            groupName: nameValue,
            parentGroupID: parentGroupID,
            groupDescription: descriptionValue,
            userID: userID
        };

        GroupsModel.create(params, function(res){
            console.log(res);
        });
        alert("Групу створено!");
        $rootScope.getAllSkills();
        $rootScope.getGroupTree();
    };

    $scope.prepareGroupToUpdate = function (groupID, groupName, newGroupName, newGroupDescription, newParentGroupID, userID, currentUserID) {
        var isMove = false;
        if (groupID == 1) {
            isMove = false;
            alert("Не можливо перемістити кореневу групу!");
            return;
        }

        if ($scope.data != null) {
            if (Number($rootScope.$currentGroup.left_key) >= Number($scope.data[0].left_key) && ($rootScope.$currentGroup.right_key <= $scope.data[0].right_key)) {
                    isMove = false;
                    alert("Не можливо перемістити дану групу в підлеглу їй групу!");
                    return;
            }
        }
        if (newParentGroupID != $scope.oldGroupID) {
            isMove = true;
        }

        if (userID != currentUserID) {
            $rootScope.saveAction('edit', 'group', groupID, groupName, newGroupName, newGroupDescription, newParentGroupID, currentUserID);
            alert('Дану дію додано до списку!');
            return;
        }

        $scope.updateGroup(newGroupName, newParentGroupID, newGroupDescription, groupID, isMove);
    };

    $scope.updateGroup = function(nameValue, parentGroupID, descriptionValue, groupID, isMove){
        var params =  {
            groupID: groupID,
            parentGroupID: parentGroupID,
            groupName: nameValue,
            groupDescription: descriptionValue,
            isMove: isMove
        };

        GroupsModel.update({'id':JSON.stringify(params)}, function(res){
            console.log(res);
        });
        alert("Групу оновлено!");

        $rootScope.getAllSkills();
        $rootScope.getGroupTree();
    };

    $scope.prepareGroupToRemove = function (groupID, groupName, parentGroupID, userID, currentUserID) {
        if (userID != currentUserID) {
            $rootScope.saveAction('remove', 'group', groupID, groupName, null, null, parentGroupID, currentUserID);
            alert('Дану дію додано до списку!');
            return;
        }
        $scope.removeGroup(groupID);
    };

    $scope.removeGroup = function(groupId){
        var params = groupId;
        var answer = confirm("Ви дійсно бажаєте видалити групу? ");
        if (answer === true) {
            GroupsModel.delete({id:params}, function (res) {
                console.log(res);
                $rootScope.getAllSkills();
                $rootScope.getGroupTree();
            });
            alert('Групу видалено!');
        }
    };

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
                $('#tree').treeview({data: $rootScope.formatDataToTree(), nodeIcon: 'glyphicon glyphicon-pencil'});
                $('#tree').on('nodeSelected', function(event, data) {
                    $rootScope.$currentGroup = data;
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

}]);