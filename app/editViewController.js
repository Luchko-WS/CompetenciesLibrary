mainApp.controller('EditViewCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'GroupsModel',
    function ($scope, $rootScope, $http, $location, $routeParams, GroupsModel) {

    const GROUPS_AND_SKILLS = 0;
    const ONLY_GROUPS = 1;

    const SKILL_MOVE = 2;
    const SKILL_COPY = 3;
    const GROUP_MOVE = 4;
    const GROUP_COPY = 5;

    $scope.data = null;
    $scope.command = null;

    $rootScope.getTree = function () {
        $rootScope.$tree = null;

        var params =  {
            skill: 'NONE',
            indicator: 'NONE',
            exportToFile: 'NONE',
            tree: 'GROUPS AND SKILLS'
        };
        GroupsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET GROUP TREE');
                $rootScope.$tree = -1;
            }
            else {
                $rootScope.$tree = res.data;
                $('#infoBox').hide();
                $('#acceptButton').hide();
                $('.cancelButton').hide();

                $('#tree1').treeview({data: $scope.formatDataToTree(GROUPS_AND_SKILLS),
                    emptyIcon: 'glyphicon glyphicon-star',
                    showTags: true,
                    enabledLinks: true
                    //selectedColor: 'yellow',
                    //selectedBackColor: 'darkorange'
                });

                $('#tree1').on('nodeUnselected', function(event, data) {
                    $('#infoBox').hide("normal");
                });

                $('#tree1').on('nodeSelected', function(event, data) {
                    $scope.currentItem1 = data;
                    //$('#infoBox').hide("normal");
                    $('#infoBox').show("normal");

                    $('#name').text("Назва: " + data.skill_name);
                    if(data.node_type == 0) {
                        $('#item_type').text("Тип: група");
                        $('#child_item_count').text("Кількість груп: " + data.count_of_child_groups + ", кількість компетенцій: " + data.count_of_child_skills);

                        $('#removeGroupButton').show();
                        $('#removeSkillButton').hide();
                        $('#showSkillButton').hide();

                        $('#moveSkillButton').hide();
                        if(data.node_level == 1) {
                            $('#moveGroupButton').hide();
                            $('#editItemButton').hide();
                        }
                        else{
                            $('#moveGroupButton').show();
                            $('#editItemButton').show();
                        }
                        $('#copySkillButton').hide();
                        $('#copyGroupButton').show();

                    }
                    else{
                        $('#item_type').text("Тип: компетенція");
                        $('#child_item_count').text("Кількість індикаторів: " + data.count_of_indicators);

                        $('#removeSkillButton').show();
                        $('#removeGroupButton').hide();
                        $('#showSkillButton').show();

                        $('#moveSkillButton').show();
                        $('#moveGroupButton').hide();
                        $('#copySkillButton').show();
                        $('#copyGroupButton').hide();
                    }
                    if(data.description != null && data.description.length != 0) {
                        $('#description').text("Опис: " + data.description);
                    }
                    else{
                        $('#description').text("");
                    }

                    $('#path').text("Шлях: " + data.path);
                    $('#user').text("Власник: " + data.user);
                    console.log($scope.currentItem1);
                });

                var itemType = null;
                $('#moveSkillButton').click(function () {
                    showSecondTree();
                    $scope.command = SKILL_MOVE;
                    $('#operation').text('Перемістити компетенцію в:')
                    itemType = 1;
                });
                $('#moveGroupButton').click(function () {
                    showSecondTree();
                    $scope.command = GROUP_MOVE;
                    $('#operation').text('Перемістити групу в:')
                    itemType = 0;
                });
                $('#copySkillButton').click(function () {
                    showSecondTree();
                    $scope.command = SKILL_COPY;
                    $('#operation').text('Скопіювати компетенцію в:')
                    itemType = 1;
                });
                $('#copyGroupButton').click(function () {
                    showSecondTree();
                    $scope.command = GROUP_COPY;
                    $('#operation').text('Скопіювати групу в:')
                    itemType = 0;
                });

                $('#acceptButton').click(function () {
                    $('#infoBox2').hide("normal");
                    hideSecondTree(itemType);
                    itemType = null;
                });
                $('.cancelButton').click(function () {
                    $('#infoBox2').hide("normal");
                    hideSecondTree(itemType);
                    itemType = null;
                });


                $('#tree2').treeview({data: $scope.formatDataToTree(ONLY_GROUPS)});

                $('#tree2').on('nodeUnselected', function(event, data) {
                    $('#infoBox2').hide("normal");
                });

                $('#tree2').on('nodeSelected', function(event, data) {
                    $scope.currentItem2 = data;
                    $('#infoBox2').hide("normal");
                    $('#infoBox2').show("normal");
                    $('#acceptButton').show();

                    $('#name2').text("Назва: " + data.skill_name);
                    $('#item_type2').text("Тип: група");
                    if(data.description != null && data.description.length != 0) {
                        $('#description2').text("Опис: " + data.description);
                    }
                    else{
                        $('#description2').text("");
                    }
                    $('#path2').text("Шлях: " + data.path);
                    $('#user2').text("Власник: " + data.user);
                });
            }
        });
    };

    var showSecondTree = function () {
        //$('#tree1').treeview('disableAll');
        $('#tree2').treeview('disableAll');
        $('#tree2').treeview('enableAll');

        $("#boxWithTree1").hide('normal');
        $("#boxWithTree2").animate({width : '100%'}, 'normal');
        $("#boxWithTree2").show('normal');
        //$("#boxWithTree1").animate({width : '50%'}, 'normal');
        $('.cancelButton').show();

        $('#editItemButton').hide();
        $('#showSkillButton').hide();
        $('#removeSkillButton').hide();
        $('#removeGroupButton').hide();
        $('#moveSkillButton').hide();
        $('#moveGroupButton').hide();
        $('#copySkillButton').hide();
        $('#copyGroupButton').hide();
    };

    var hideSecondTree = function (item_type) {
        //$('#tree1').treeview('enableAll');
        $("#boxWithTree2").hide('normal');
        $("#boxWithTree1").animate({width : '100%'}, 'normal');
        $("#boxWithTree1").show('normal');

        $('#editItemButton').show();
        $('#acceptButton').hide();
        $('.cancelButton').hide();
        if(item_type == 1) {

            $('#showSkillButton').show();
            $('#removeSkillButton').show();
            $('#moveSkillButton').show();
            $('#copySkillButton').show();

        }
        else {
            $('#removeGroupButton').show();
            $('#moveGroupButton').show();
            $('#copyGroupButton').show();
        }
    };

    $scope.formatDataToTree = function(param) {
        var root = $rootScope.$tree[0];
        root.text = $rootScope.$tree[0].skill_name;
        root.node_id = 0;
        root.tags = [$rootScope.$tree[0].count_of_child_skills, $rootScope.$tree[0].count_of_child_groups];
        var stack = [0];
        var tagsStack = [0];
        var currentLevel = 2;

        for(var i = 1; i < $rootScope.$tree.length; i++) {
            $rootScope.$tree[i].node_id = i;
            $rootScope.$tree[i].nodes = null;
            $rootScope.$tree[i].text = $rootScope.$tree[i].skill_name;

            if($rootScope.$tree[i].node_type == 0) {
                $rootScope.$tree[i].tags = [$rootScope.$tree[i].count_of_child_skills, $rootScope.$tree[i].count_of_child_groups];
            }
            else {
                $rootScope.$tree[i].tags = [$rootScope.$tree[i].count_of_indicators];
            }

            if(currentLevel == $rootScope.$tree[i].node_level){
                $rootScope.$tree[i].parentId = stack[0];
                tagsStack[0]++;
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

        var map = {}, node, roots = [], items = $rootScope.$tree;
        if(param == GROUPS_AND_SKILLS) {
            for (var i = 1; i < items.length; i++) {
                node = items[i];
                if (node.node_type == 0) {
                    node.nodes = [];
                }
                else {
                    node.nodes = null;
                }
                map[node.node_id] = i;
                if (node.parentId !== 0) {
                    if (items[map[node.parentId]].nodes == null) {
                        items[map[node.parentId]].nodes = [];
                    }
                    items[map[node.parentId]].nodes.push(node);
                } else {
                    roots.push(node);
                }
            }
        }
        else {
            for (var i = 1; i < items.length; i++) {
                if(items[i].node_type == 1){
                    continue;
                }
                node = items[i];
                map[node.node_id] = i;
                if (node.parentId !== 0) {
                    if (items[map[node.parentId]].nodes == null) {
                        items[map[node.parentId]].nodes = [];
                    }
                    items[map[node.parentId]].nodes.push(node);
                } else {
                    roots.push(node);
                }
            }
        }
        root.nodes = roots;
        return [root];
    };

    $scope.openItem = function () {
        if($scope.currentItem1.node_type == 1){
            $location.path('/skill/' + $scope.currentItem1.id + '/show');
        }
    };

    $scope.editItem = function () {
        if($scope.currentItem1.node_type == 1){
            $location.path('/skill/' + $scope.currentItem1.id + '/edit');
        }
        else{
            $location.path('/group/' + $scope.currentItem1.id + '/edit');
        }
    };

    $scope.moveOrCopyItem = function () {
        switch ($scope.command){
            case SKILL_COPY:
                $rootScope.prepareSkillToCopy($scope.currentItem1.id, $scope.currentItem1.skill_name, $scope.currentItem1.description,
                    $scope.currentItem2.id, $scope.currentItem2.user_id, $rootScope.$user.id);
                break;
            case SKILL_MOVE:
                $rootScope.prepareSkillToMove($scope.currentItem1.id, $scope.currentItem1.skill_name, $scope.currentItem1.skill_name,
                    $scope.currentItem1.description, $scope.currentItem2.id, $scope.currentItem1.user_id, $rootScope.$user.id);
                break;
            case GROUP_COPY:
                $rootScope.prepareGroupToCopy($scope.currentItem1.id, $scope.currentItem1.skill_name, $scope.currentItem1.description,
                    $scope.currentItem2.id, $scope.currentItem2.user_id, $rootScope.$user.id);
                break;
            case GROUP_MOVE:
                $rootScope.prepareGroupToMove($scope.currentItem1.id, $scope.currentItem1.skill_name, $scope.currentItem1.skill_name,
                    $scope.currentItem1.description, $scope.currentItem2.id, $scope.currentItem1.user_id, $rootScope.$user.id);
                break;
        }
    }

}]);