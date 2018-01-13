mainApp.controller('GroupsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'GroupsModel',
    function ($scope, $rootScope, $http, $location, $routeParams, GroupsModel) {

    ///Змінна даних групи
    $scope.groupData = null;
    //Змінні форми (моделі)
    $scope.nameText = null;
    $scope.groupText = null;
    $scope.descriptionText = null;
    //Змінна для збереження попередньої батьківської групи
    //(для перевірки чи відбувається переміщення)
    $scope.oldGroupID = null;

    /**
    БЛОК РОБОТИ З ПАРАМЕТРАМИ АДРЕСНОГО РЯДКА
     **/
    $scope.getRouteParamGroupID_GroupCtrl = function () {
        return $routeParams.id;
    };
    /**
    КІНЕЦЬ БЛОКУ РОБОТИ З ПАРАМЕТРАМИ АДРЕСНОГО РЯДКА
    **/

    /**
    БЛОК ІНТЕРФЕЙСУ
     **/
    //ПОВІДОМЛЕННЯ
    $scope.messageBoxClass = null;
    $scope.messageTitleText = null;
    $scope.messageText = null;
    //Виведення повідомлення
    function showMessageWindow(messageClass, messageTittle, messageBody) {
        $scope.messageTitleText = messageTittle;
        $scope.messageText = messageBody;
        $scope.messageBoxClass = messageClass;
        $('#messageBox').fadeIn("slow");
		setTimeout("$('#messageBox').hide('slow')", 5000);
    }
    //Кнопка закриття повідомлення
    $("#closeMessageBoxButton").click(function () {
        $('#messageBox').fadeOut("slow");
    });

    //ДЕРЕВО ГРУП
    //Вибір групи з дерева
    $scope.show = false;
    $scope.onClickSelectCurrentGroup = function(isHide){
        if(isHide){
            return "Обрати групу";
        }
        else {
            if($rootScope.$currentGroup!=null) {
                $scope.groupText = $rootScope.$currentGroup.name;
            }
            return "Обрати групу з дерева";
        }
    };

    $("#toggleButton").click(function () {
        $("#toggleBox").slideToggle("normal");
    });

    //Отримання ID вибраного елемента в дереві
    $scope.getSelectGroupID = function () {
        if($rootScope.$currentGroup!=null){
            return $rootScope.$currentGroup.id;
        }
    };
    /**
    КІНЕЦЬ БЛОКУ ІНТЕРФЕЙСУ
     **/

    /**
    БЛОК МАНІПУЛЯЦЇ ГРУПАМИ
     **/
    //GETTERS
    //ОТРИМАННЯ ТА ПІДГОТОВКИ ДЕРЕВА ДЛЯ ГОЛОВНОЇ СТОРІНКИ
    //Отримання дерева для головної сторінки
    $rootScope.getGroupTreeForMainPage = function () {
        $rootScope.$tree = null;
        $rootScope.$currentGroup = null;
        var params = {
            tree: 'GROUPS'
        };

        function asyncQuery() {
            GroupsModel.get({'id': JSON.stringify(params)}, function (res) {
                if (res.data === undefined) {
                    console.log('Не вдалося отримати дерево (res.data === undefined)');
                }
                else {
                    $rootScope.$tree = res.data;
                    $('#tree').treeview({data: $rootScope.formatDataToTree()});
                    $('#tree').on('nodeUnselected', function (event, data) {
                        $rootScope.$currentGroup = null;
                        $('#editTreeNodeButtons').hide();
                    });
                    $('#tree').on('nodeSelected', function (event, data) {
                        $rootScope.$currentGroup = data;
                        $rootScope.getObjectsByGroup($rootScope.$currentGroup.id);
                        $rootScope.$pagination.page = 1;
                        $('#editTreeNodeButtons').show();
                        if (data.node_level == 1) {
                            $('#editItemButton').hide();
                        }
                        else {
                            $('#editItemButton').show();
                        }
                    });
                }
            }, function (err) {
                console.log('Не вдалося отримати дерево');
                console.log(err);
            });
        };

        setTimeout(asyncQuery, 0);
    };
    //Отримання дерева (при редагуванні груп, об'єктів, імпорті файлів)
    $rootScope.getGroupTree = function () {
        $rootScope.$tree = null;
        $rootScope.$currentGroup = null;
        var params =  {
            tree: 'GROUPS'
        };

        function asyncQuery() {
            GroupsModel.get({'id':JSON.stringify(params)}, function (res) {
                if(res.data === undefined) {
                    console.log('Не вдалося отримати дерево (res.data === undefined)');
                }
                else {
                    $rootScope.$tree = res.data;
                    $('#tree').treeview({data: $rootScope.formatDataToTree()});
                    $('#tree').on('nodeUnselected', function(event, data) {
                        $rootScope.$currentGroup = null;
                    });
                    $('#tree').on('nodeSelected', function(event, data) {
                        $rootScope.$currentGroup = data;
                    });
                }
            }, function (err) {
                console.log('Не вдалося отримати дерево');
                console.log(err);
            });
        };
        setTimeout(asyncQuery, 0);
    };
    //Форматування отриманих даних під Bootstrap Tree View
    $rootScope.formatDataToTree = function() {
        var root = $rootScope.$tree[0];
        root.text = $rootScope.$tree[0].name;
        root.node_id = 0;
        var stack = [0];
        var currentLevel = 2;

        for(var i = 1; i < $rootScope.$tree.length; i++) {
            $rootScope.$tree[i].node_id = i;
            $rootScope.$tree[i].nodes = null;
            $rootScope.$tree[i].text = $rootScope.$tree[i].name;

            if(currentLevel == $rootScope.$tree[i].node_level){
                $rootScope.$tree[i].parentId = stack[0];
            }
            else if(currentLevel < $rootScope.$tree[i].node_level){
                stack.unshift($rootScope.$tree[i-1].node_id);
                $rootScope.$tree[i].parentId = stack[0];
                currentLevel++;
            }
            else if(currentLevel > $rootScope.$tree[i].node_level) {
                for(var j = 0; j < currentLevel - $rootScope.$tree[i].node_level; j++) {
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
        console.log((root.nodes));
        return [root];
    };

    //Отримання групи
    $scope.getGroup = function (groupID, setDataIntoForm) {
        $scope.oldGroupID = null;
        $scope.groupData = null;
        $rootScope.$currentGroup = null;
        var params =  {
            tree: false,
            groupID: groupID
        };

        function asyncQuery() {
            GroupsModel.get({'id': JSON.stringify(params)}, function (res) {
                if (res.data === undefined) {
                    console.log("Помилка при отриманні групи! (res.data === undefined)");
                    console.log(res);
                    $scope.groupData = -1;
                }
                else {
                    $scope.groupData = res.data;
                    if (setDataIntoForm) {
                        $scope.nameText = $scope.groupData[0].name;
                        $rootScope.$currentGroup = $scope.groupData[0].parent_node;
                        $scope.oldGroupID = $rootScope.$currentGroup.id;
                        $scope.groupText = $rootScope.$currentGroup.name;
                        $scope.descriptionText = $scope.groupData[0].description;
                    }
                }
            }, function (err) {
                console.log("Помилка при отриманні групи!");
                console.log(err);
                $scope.groupData = -1;
            });
        };
        setTimeout(asyncQuery, 0);
    };

    //СТВОРЕННЯ ГРУПИ
    //Підготовка до створення групи
    $scope.prepareGroupToCreate = function (groupName, groupDescription, parentGroupID, parentGroupUserID, currentUserID) {
        if (!parentGroupID || !groupName) {
            showMessageWindow("alert alert-danger", "Увага!", "Заповніть поля назви і групи!");
            return;
        }
        if (currentUserID != parentGroupUserID && $rootScope.$currentGroup.left_key != 1) {
            $rootScope.saveAction('create', 'group', -1, groupName, null, groupDescription, parentGroupID, currentUserID);
            showMessageWindow("alert alert-info", "Увага!", "Дану дію додано до списку.");
            return;
        }
        $scope.createGroup(groupName, parentGroupID, groupDescription, currentUserID);
    };

    //Створення групи
    $scope.createGroup = function(groupName, parentGroupID, groupDescription, userID){
        var params =  {
            groupName: groupName,
            parentGroupID: parentGroupID,
            groupDescription: groupDescription,
            userID: userID
        };
        GroupsModel.create(params, function(res){
            console.log("Групу створено!");
            console.log(res);
            showMessageWindow("alert alert-success", "Групу створено!", "Дію успішно виконано. Групу створено.");
        },function (err) {
            console.log("Групу створено!");
            showMessageWindow("alert alert-success", "Групу створено!", "Дію успішно виконано. Групу створено.");
            /*
            console.log("Групу не створено!");
            console.log(err);
            showMessageWindow("alert alert-danger", "Помилка!", "Не вдалося створити групу.");*/
        });
    };

    //Підготовка до копіювання групи
    $rootScope.prepareGroupToCopy = function (groupID, groupName, groupDescription, parentGroupID, parentGroupUserID, currentUserID) {
        if (currentUserID != parentGroupUserID) {
            $rootScope.saveAction('copy', 'group', groupID, groupName, null, groupDescription, parentGroupID, currentUserID);
            alert("Дану дію додано до списку.");
            return;
        }
        $scope.copyGroup(groupID, groupName, parentGroupID, groupDescription, currentUserID, 1);
    };

    //Копіювання групи
    $scope.copyGroup = function(groupID, groupName, parentGroupID, groupDescription, userID, reloadEditView){
        var params =  {
            groupID: groupID,
            groupName: groupName,
            parentGroupID: parentGroupID,
            groupDescription: groupDescription,
            isCopy: true,
            userID: userID
        };
        GroupsModel.create(params, function(res){
            console.log("Групу скопійовано!");
            console.log(res);
            alert("Дію успішно виконано. Групу скопійовано.");
            $rootScope.getTree();
        },function (res) {
            console.log("Групу не скопійовано!!");
            console.log(res);
            alert("Не вдалося скопіювати групу.");
        });
    };

    //РЕДАГУВАННЯ ГРУПИ
    //Підготовка групи до оновлення
    $scope.prepareGroupToUpdate = function (groupID, groupName, newGroupName, newGroupDescription, newParentGroupID, userID, currentUserID) {
        var isMove = false;
        if (newParentGroupID != $scope.oldGroupID) {
            isMove = true;
            if (Number($rootScope.$currentGroup.left_key) >= Number($scope.groupData[0].left_key) && ($rootScope.$currentGroup.right_key <= $scope.groupData[0].right_key)) {
                isMove = false;
                showMessageWindow("alert alert-danger", "Увага!", "Не можливо перемістити дану групу в підлеглу їй групу!");
                return;
            }
        }
        if (userID != currentUserID) {
            $rootScope.saveAction('edit', 'group', groupID, groupName, newGroupName, newGroupDescription, newParentGroupID, currentUserID);
            showMessageWindow("alert alert-info", "Увага!", "Дану дію додано до списку.");
            return;
        }
        $scope.updateGroup(groupID, newGroupName, newParentGroupID, newGroupDescription, isMove);
    };

    //Підготовка групи до переміщення
    $rootScope.prepareGroupToMove = function (groupID, groupName, newGroupName, newGroupDescription, newParentGroupID, userID, currentUserID) {
        if (userID != currentUserID) {
            $rootScope.saveAction('edit', 'group', groupID, groupName, newGroupName, newGroupDescription, newParentGroupID, currentUserID);
            alert("Дану дію додано до списку.");
            return;
        }
        $scope.updateGroup(groupID, newGroupName, newParentGroupID, newGroupDescription, 1, 1);
    };

    //Оновлення групи
    $scope.updateGroup = function(groupID, groupName, parentGroupID, groupDescription, isMove, reloadEditView){
        var params =  {
            groupID: groupID,
            groupName: groupName,
            parentGroupID: parentGroupID,
            groupDescription: groupDescription,
            isMove: isMove
        };
        GroupsModel.update({'id':JSON.stringify(params)}, function(res){
            console.log("Групу оновлено!");
            console.log(res);
            if(reloadEditView){
                alert("Дію успішно виконано. Групу оновлено.");
                $rootScope.getTree();
            }
            else {
                showMessageWindow("alert alert-success", "Групу оновлено!", "Дію успішно виконано. Групу оновлено.");
            }
        }, function(err){
            console.log("Групу не оновлено!!");
            console.log(err);
            if(reloadEditView){
                alert("Не вдалося оновити групу.");
            }
            else {
                showMessageWindow("alert alert-danger", "Помилка!", "Не вдалося оновити групу.");
            }
        });
    };

    //ВИДАЛЕННЯ ГРУПИ
    //Підготовка до видалення групи
    $scope.prepareGroupToRemove = function (groupID, groupName, parentGroupID, userID, currentUserID, reloadEditView) {
        var answer = confirm("Ви дійсно бажаєте видалити групу? ");
        if (answer === true) {
            if (userID != currentUserID) {
                $rootScope.saveAction('remove', 'group', groupID, groupName, null, null, parentGroupID, currentUserID);;
                alert("Дану дію додано до списку.");
                return;
            }
            $scope.removeGroup(groupID, reloadEditView);
        }
    };

    //Видалення групи
    $scope.removeGroup = function(groupID, reloadEditView){
        var params = groupID;
        GroupsModel.delete({id:params}, function (res) {
            if(!reloadEditView){
                $rootScope.$currentGroup = null;
                $('#editTreeNodeButtons').hide();
            }
            console.log("Групу видалено!");
            console.log(res);

            if(reloadEditView){
                $rootScope.getTree();
            }
            else {
                $rootScope.getAllObjects();
                $rootScope.getGroupTreeForMainPage();
            }
        }, function (err){
            console.log("Групу не видалено!!");
            console.log(err);
            alert("Не вдалося видалити групу.");
        });
    };
    /**
     КІНЕЦЬ БЛОКУ МАНІПУЛЯЦІЇ ГРУПАМИ
     **/
}]);