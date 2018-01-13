mainApp.controller('EditViewCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'GroupsModel',
    function ($scope, $rootScope, $http, $location, $routeParams, GroupsModel) {

    /**
     БЛОК КОНСТАНТ
     **/
    //Тип форматування дерева для Bootstrap Tree View
    const GROUPS_AND_OBJECTS = 0;
    const ONLY_GROUPS = 1;
    //Тип операції, що викликала друге дерево Bootstrap Tree View
    const OBJECT_MOVE = 2;
    const OBJECT_COPY = 3;
    const GROUP_MOVE = 4;
    const GROUP_COPY = 5;
    /**
     КІНЕЦЬ БЛОКУ КОНСТАНТ
     **/
    //Змінна для збереження типу операції
    $scope.command = null;

    /**
     БЛОК ОТРИМАННЯ ТА ФОРМАТУВАННЯ ДЕРЕВ
     **/
    $rootScope.getTree = function () {
        $rootScope.$tree = null;
        var params =  {
            tree: 'GROUPS AND OBJECTS'
        };

        function asyncQuery() {
            GroupsModel.get({'id': JSON.stringify(params)}, function (res) {
                if (res.data === undefined) {
                    console.log('Не вдалося отримати дерево! (res.data === undefined)');
                    $rootScope.$tree = -1;
                }
                else {
                    $rootScope.$tree = res.data;
                    $('#infoBox').hide();
                    $('#acceptButton').hide();
                    $('.cancelButton').hide();

                    $('#tree1').treeview({
                        data: $scope.formatDataToTree(GROUPS_AND_OBJECTS),
                        emptyIcon: 'glyphicon glyphicon-star',
                        showTags: true,
                        enabledLinks: true
                        //selectedColor: 'yellow',
                        //selectedBackColor: 'darkorange'
                    });

                    $('#tree1').on('nodeUnselected', function (event, data) {
                        $('#infoGroup').hide('quickly');
                        setTimeout("$('#treeGroup').removeClass('col-lg-7 col-md-7'); $('#treeGroup').addClass('col-lg-12 col-md-12')", 200);
                    });

                    $('#tree1').on('nodeSelected', function (event, data) {
                        $scope.currentItem1 = data;
                        //$('#infoBox').hide("normal");

                        //$("#infoGroup").animate({width : '40%'}, 'normal');
                        $('#infoGroup').show("quickly");
                        setTimeout("$('#treeGroup').removeClass('col-lg-12 col-md-12'); $('#treeGroup').addClass('col-lg-7 col-md-7')", 200);

                        $('#infoBox').show("normal");

                        $('#name').text("Назва: " + data.name);
                        if (data.node_type == 0) {
                            $("#importButton").show();
                            $('#item_type').text("Тип: група");
                            $('#child_item_count').text("Кількість груп: " + data.count_of_child_groups + ", кількість об'єктів: " + data.count_of_child_objects);

                            $('#removeGroupButton').show();
                            $('#removeObjectButton').hide();
                            $('#showObjectButton').hide();

                            $('#moveObjectButton').hide();
                            if (data.node_level == 1) {
                                $('#moveGroupButton').hide();
                                $('#editItemButton').hide();
                            }
                            else {
                                $('#moveGroupButton').show();
                                $('#editItemButton').show();
                            }
                            $('#copyObjectButton').hide();
                            $('#copyGroupButton').show();

                        }
                        else {
                            $("#importButton").hide();
                            $('#item_type').text("Тип: об'єкт");
                            $('#child_item_count').text("Кількість індикаторів: " + data.count_of_indicators);

                            $('#removeObjectButton').show();
                            $('#removeGroupButton').hide();
                            $('#showObjectButton').show();

                            $('#moveObjectButton').show();
                            $('#moveGroupButton').hide();
                            $('#copyObjectButton').show();
                            $('#copyGroupButton').hide();
                        }
                        if (data.description != null && data.description.length != 0) {
                            $('#description').text("Опис: " + data.description);
                        }
                        else {
                            $('#description').text("");
                        }

                        $('#path').text("Шлях: " + data.path);
                        $('#user').text("Власник: " + data.user);
                        $('#creation_date').text("Створено: " + data.creation_date);
                        console.log($scope.currentItem1);
                    });

                    var itemType = null;
                    $('#moveObjectButton').click(function () {
                        showSecondTree();
                        $scope.command = OBJECT_MOVE;
                        $('#operation').text("Перемістити об'єкт в:")
                        itemType = 1;
                    });
                    $('#moveGroupButton').click(function () {
                        showSecondTree();
                        $scope.command = GROUP_MOVE;
                        $('#operation').text('Перемістити групу в:')
                        itemType = 0;
                    });
                    $('#copyObjectButton').click(function () {
                        showSecondTree();
                        $scope.command = OBJECT_COPY;
                        $('#operation').text("Скопіювати об'єкт в:")
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

                    $('#tree2').on('nodeUnselected', function (event, data) {
                        $('#infoBox2').hide("normal");
                    });

                    $('#tree2').on('nodeSelected', function (event, data) {
                        $scope.currentItem2 = data;
                        $('#infoBox2').hide("normal");
                        $('#infoBox2').show("normal");
                        $('#acceptButton').show();

                        $('#name2').text("Назва: " + data.name);
                        $('#item_type2').text("Тип: група");
                        if (data.description != null && data.description.length != 0) {
                            $('#description2').text("Опис: " + data.description);
                        }
                        else {
                            $('#description2').text("");
                        }
                        $('#path2').text("Шлях: " + data.path);
                        $('#user2').text("Власник: " + data.user);
                    });
                }
            }, function (err) {
                console.log('Не вдалося отримати дерево! (res.data === undefined)');
                console.log(err);
            });
        };
        setTimeout(asyncQuery, 0);
    };

    //Підготовка до показу другого дерева
    var showSecondTree = function () {
        //$('#tree1').treeview('disableAll');
        $('#tree2').treeview('disableAll');
        $('#tree2').treeview('enableAll');

        $("#controlPanel").hide();
        $("#boxWithTree1").hide('normal');
        $("#boxWithTree2").animate({width : '100%'}, 'normal');
        $("#boxWithTree2").show('normal');
        //$("#boxWithTree1").animate({width : '50%'}, 'normal');
        $('.cancelButton').show();

        $('#editItemButton').hide();
        $('#showObjectButton').hide();
        $('#removeObjectButton').hide();
        $('#removeGroupButton').hide();
        $('#moveObjectButton').hide();
        $('#moveGroupButton').hide();
        $('#copyObjectButton').hide();
        $('#copyGroupButton').hide();
    };

    //Підготовка до приховування другого дерева
    var hideSecondTree = function (item_type) {
        //$('#tree1').treeview('enableAll');
        $("#controlPanel").show();
        $("#boxWithTree2").hide('normal');
        $("#boxWithTree1").animate({width : '100%'}, 'normal');
        $("#boxWithTree1").show('normal');

        $('#editItemButton').show();
        $('#acceptButton').hide();
        $('.cancelButton').hide();

        if(item_type == 1) {
            $('#showObjectButton').show();
            $('#removeObjectButton').show();
            $('#moveObjectButton').show();
            $('#copyObjectButton').show();
        }
        else {
            $('#removeGroupButton').show();
            $('#moveGroupButton').show();
            $('#copyGroupButton').show();
        }
    };

    //Форматування дерева
    $scope.formatDataToTree = function(param) {
        var root = $rootScope.$tree[0];
        root.text = $rootScope.$tree[0].name;
        root.node_id = 0;
        root.tags = [$rootScope.$tree[0].count_of_child_objects, $rootScope.$tree[0].count_of_child_groups];
        var stack = [0];
        var tagsStack = [0];
        var currentLevel = 2;

        for(var i = 1; i < $rootScope.$tree.length; i++) {
            $rootScope.$tree[i].node_id = i;
            $rootScope.$tree[i].nodes = null;
            $rootScope.$tree[i].text = $rootScope.$tree[i].name;

            if($rootScope.$tree[i].node_type == 0) {
                $rootScope.$tree[i].tags = [$rootScope.$tree[i].count_of_child_objects, $rootScope.$tree[i].count_of_child_groups];
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
        if(param == GROUPS_AND_OBJECTS) {
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
    /**
     КІНЕЦЬ БЛОКУ ОТРИМАННЯ ТА ФОРМАТУВАННЯ ДЕРЕВ
     **/

    /**
     БЛОК ОПЕРАЦІЙ З ЕЛЕМЕНТАМИ ДЕРЕВА
     **/
    $scope.openItem = function () {
        if($scope.currentItem1.node_type == 1){
            $location.path('/object/' + $scope.currentItem1.id + '/show');
        }
    };

    $scope.editItem = function () {
        if($scope.currentItem1.node_type == 1){
            $location.path('/object/' + $scope.currentItem1.id + '/edit');
        }
        else{
            $location.path('/group/' + $scope.currentItem1.id + '/edit');
        }
    };

    $scope.moveOrCopyItem = function () {
        switch ($scope.command){
            case OBJECT_COPY:
                $rootScope.prepareObjectToCopy($scope.currentItem1.id, $scope.currentItem1.name, $scope.currentItem1.description,
                    $scope.currentItem2.id, $scope.currentItem2.user_id, $rootScope.$user.id);
                break;
            case OBJECT_MOVE:
                $rootScope.prepareObjectToMove($scope.currentItem1.id, $scope.currentItem1.name, $scope.currentItem1.name,
                    $scope.currentItem1.description, $scope.currentItem2.id, $scope.currentItem1.user_id, $rootScope.$user.id);
                break;
            case GROUP_COPY:
                $rootScope.prepareGroupToCopy($scope.currentItem1.id, $scope.currentItem1.name, $scope.currentItem1.description,
                    $scope.currentItem2.id, $scope.currentItem2.user_id, $rootScope.$user.id);
                break;
            case GROUP_MOVE:
                $rootScope.prepareGroupToMove($scope.currentItem1.id, $scope.currentItem1.name, $scope.currentItem1.name,
                    $scope.currentItem1.description, $scope.currentItem2.id, $scope.currentItem1.user_id, $rootScope.$user.id);
                break;
        }
    };
    /**
     КІНЕЦЬ БЛОКУ ОПЕРАЦІЙ З ЕЛЕМЕНТАМИ ДЕРЕВА
     **/
}]);