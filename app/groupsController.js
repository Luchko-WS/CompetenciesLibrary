mainApp.controller('GroupsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'GroupsModel', function ($scope, $rootScope, $http, $location, $routeParams, GroupsModel) {

    $scope.data = null;

    $scope.nameText = null;
    $scope.groupText = null;
    $scope.descriptionText = null

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

    $scope.getGroup = function (groupId) {

        var params =  {
            tree: false,
            groupId: groupId
        };

        GroupsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET GROUP');
            }
            else {
                $scope.data = res.data;
                $scope.nameText = res.data[0].skill_name;
                $rootScope.$currentGroup = $rootScope.getCurrentGroup($scope.data[0].left_key,
                    $scope.data[0].right_key, $scope.data[0].node_level);
                $scope.groupText = $rootScope.$currentGroup.skill_name;
                $scope.descriptionText = res.data[0].description;
            }
        });
    };

    $scope.saveGroup = function(nameValue, groupRightKeyValue, groupLevelValue, descriptionValue, groupId, userId){

        var value =  {
            groupId: groupId,
            groupName: nameValue,
            groupRightKey: groupRightKeyValue,
            groupLevel: groupLevelValue,
            groupDescription: descriptionValue,
            userId: userId
        };

        GroupsModel.save(value, function(res){
            console.log(res);
        });

        alert("Групу збережено!");

        $rootScope.getAllSkills();
        $rootScope.getGroupTree();
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
                $('#tree').treeview({data: formatDataToTree()});

                $('#tree').on('nodeSelected', function(event, data) {
                    $rootScope.$currentGroup = data;
                });
            }
        });
    };

    function formatDataToTree() {

        var tree = $rootScope.$tree;
        var root = tree[0];
        root.text = tree[0].skill_name;
        root.node_id = 0;

        var indexMap = [0];
        var currentLevel = 2;

        for(var i = 1; i < tree.length; i++) {

            tree[i].node_id = i;
            tree[i].nodes = null;
            tree[i].text = tree[i].skill_name;
            if(tree[i].node_level == 2){
                tree[i].parentId = indexMap[0];
            }
            else{
                if(currentLevel == tree[i].node_level){
                    tree[i].parentId = indexMap[tree[i].node_level - 2];
                }
                else if(currentLevel < tree[i].node_level){
                    if(tree[i].node_level - 1 > indexMap.length){
                        indexMap.push(i-1);
                        tree[i].parentId = indexMap[tree[i].node_level - 2];
                        currentLevel = tree[i].node_level;
                    }
                    else{
                        indexMap[tree[i].node_level - 2] = i-1;
                        tree[i].parentId = indexMap[tree[i].node_level - 2];
                        currentLevel = tree[i].node_level;
                    }
                }
                else if(currentLevel > tree[i].node_level){
                    tree[i].parentId = indexMap[tree[i].node_level - 2];
                    currentLevel = tree[i].node_level;
                }
            }
        }

        var map = {}, node, roots = [];
        for (var i = 1; i < tree.length; i ++) {
            node = tree[i];
            node.nodes = null;
            map[node.node_id] = i;
            if (node.parentId !== 0) {
                if(tree[map[node.parentId]].nodes == null) {
                    tree[map[node.parentId]].nodes = [];
                }
                tree[map[node.parentId]].nodes.push(node);
            } else {
                roots.push(node);
            }
        }

        root.nodes = roots;
        return [root];
    }

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