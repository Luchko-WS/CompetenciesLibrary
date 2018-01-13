mainApp.controller('ObjectsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'ObjectsModel',
    function ($scope, $rootScope, $http, $location, $routeParams, ObjectsModel) {

    //Змінна даних об'єкта
    $scope.objectData = null;
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
    $scope.getRouteParamObjectID_ObjectCtrl = function () {
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
    /**
    КІНЕЦЬ БЛОКУ ІНТЕРФЕЙСУ
    **/

    /**
    БЛОК МАНІПУЛЯЦІЇ ОБ'ЄКТАМИ
    **/
    //GETTERS
    //Отримання всіх об'єктів
    $rootScope.getAllObjects = function () {
        //Якщо на панелі обрана група, то потрібно отримати об'єкти цієї групи
        if($rootScope.$currentGroup){
            $scope.getObjectsByGroup($rootScope.$currentGroup.id);
        }
        else
        {
            $scope.objectData = null;
            $rootScope.$currentGroup = null;
            var params = {
                objectID: 'ALL_OBJECTS'
            };

            function asyncQuery() {
                ObjectsModel.get({'id': JSON.stringify(params)}, function (res) {
                    if (res.data === undefined) {
                        console.log("Не вдалося отримати усі об'єкти! (res.data === undefined)");
                        $scope.objectData = -1;
                    }
                    else {
                        $scope.objectData = res.data.rows;

                    }
                }, function (err) {
                    console.log("Не вдалося отримати усі об'єкти!");
                    console.log(err);
                    $scope.objectData = -1;
                });
            };
            setTimeout(asyncQuery, 0);
        }
    };

    //Отримання об'єктів по групі
    $rootScope.getObjectsByGroup = function (groupID) {
        $scope.objectData = null;
        var params =  {
            objectID: 'BY_GROUP',
            groupID: groupID
        };

        function asyncQuery() {
            ObjectsModel.get({'id': JSON.stringify(params)}, function (res) {
                if (res.data === undefined) {
                    console.log("Не вдалося отримати об'єкти даної групи! (res.data === undefined)");
                    $scope.objectData = -1;
                }
                else {
                    $scope.objectData = res.data.rows;
                }
            }, function (err) {
                console.log("Не вдалося отримати об'єкти даної групи!");
                console.log(err);
                $scope.objectData = -1;
            });
        };
        setTimeout(asyncQuery, 0);
    };

    //Отримання об'єкта
    $rootScope.getObject = function (objectID, setDataIntoForm) {
        $scope.objectData = null;
        $rootScope.$currentGroup = null;
        $scope.oldGroupID = null;
        var params =  {
            objectID: objectID
        };

        function asyncQuery() {
            ObjectsModel.get({'id': JSON.stringify(params)}, function (res) {
                if (res.data === undefined) {
                    console.log("Не вдалося отримати об'єкт! (res.data === undefined)");
                    $scope.objectData = -1;
                }
                else {
                    $scope.objectData = res.data;
                    if (setDataIntoForm) {
                        $scope.nameText = $scope.objectData[0].name;
                        $rootScope.$currentGroup = $scope.objectData[0].parent_node;
                        $scope.groupText = $rootScope.$currentGroup.name;
                        $scope.oldGroupID = $rootScope.$currentGroup.id;
                        $scope.descriptionText = $scope.objectData[0].description;
                    }
                }
            }, function (err) {
                console.log("Не вдалося отримати об'єкт!");
                console.log(err);
                $scope.objectData = -1;
            });
        };
        setTimeout(asyncQuery, 0);
    };

    //СТВОРЕННЯ ОБ'ЄКТА
    //Підготовка до створення об'єкта
    $scope.prepareObjectToCreate = function (objectName, objectDescription, parentGroup, currentUserID) {
        if(!objectName || !parentGroup.id){
            showMessageWindow("alert alert-danger", "Увага!", "Заповніть поля назви і групи!");
            return;
        }
        if(parentGroup.node_level == 1){
            showMessageWindow("alert alert-danger", "Увага!", "Не можна створювати об'єкт в кореневій групі!");
            return;
        }

        if (currentUserID != parentGroup.user_id) {
            $rootScope.saveAction('create', 'object', -1, objectName, null, objectDescription, parentGroup.id, currentUserID);
            showMessageWindow("alert alert-info", "Увага!", "Дану дію додано до списку.");
            return;
        }
        $scope.createObject(objectName, parentGroup.id, objectDescription, currentUserID);
    };

    //Створення об'єкта
    $scope.createObject = function(objectName, groupID, objectDescription, userID){
        var params =  {
            objectName: objectName,
            groupID: groupID,
            objectDescription: objectDescription,
            userID: userID
        };
        console.log("CREATE");
        ObjectsModel.create(params, function(res){
            console.log("Об'єкт створено!");
            console.log(res);
            showMessageWindow("alert alert-success", "Увага!", "Дію успішно виконано. Об'єкт створено.");
        }, function (err) {
            console.log("Об'єкт створено!");
            showMessageWindow("alert alert-success", "Увага!", "Дію успішно виконано. Об'єкт створено.");
            /*console.log("Об'єкт не створено!");
            console.log(err);
            showMessageWindow("alert alert-danger", "Помилка!", "Не вдалося створити об'єкт.");*/
        });
    };

    //Підготовка до копіювання об'єкта
    $rootScope.prepareObjectToCopy = function (objectID, objectName, objectDescription, parentGroupID, parentGroupUserID, currentUserID) {
        if (currentUserID != parentGroupUserID) {
            $rootScope.saveAction('copy', 'object', objectID, objectName, null, objectDescription, parentGroupID, currentUserID);
            alert("Дану дію додано до списку.");
            return;
        }
        $scope.copyObject(objectID, objectName, parentGroupID, objectDescription, currentUserID);
    };

    //Копіювання об'єкта
    $scope.copyObject = function(objectID, objectName, groupID, objectDescription, userID){
        var params =  {
            objectID: objectID,
            objectName: objectName,
            groupID: groupID,
            objectDescription: objectDescription,
            isCopy: true,
            userID: userID
        };
        ObjectsModel.create(params, function(res){
            console.log("Об'єкт скопійовано!");
            console.log(res);
            alert("Дію успішно виконано. Об'єкт скопійовано.");
            $rootScope.getTree();
        }, function (err) {
            console.log("Об'єкт не скопійовано!");
            console.log(err);
            alert("Не вдалося скопіювати об'єкт.");
        });
    };

    //РЕДАГУВАННЯ ОБ'ЄКТА
    //Підготовка об'єкта до оновлення
    $scope.prepareObjectToUpdate = function (objectID, objectName, newObjectName, newObjectDescription, newParentGroupID, userID, currentUserID) {
        if(!objectName || !newParentGroupID){
            showMessageWindow("alert alert-danger", "Увага!", "Заповніть поля назви і групи!");
            return;
        }
        var isMove = false;
        if($scope.oldGroupID != newParentGroupID){
            isMove = true;
        }
        if (userID != currentUserID) {
            $rootScope.saveAction('edit', 'object', objectID, objectName, newObjectName, newObjectDescription, newParentGroupID, currentUserID);
            showMessageWindow("alert alert-info", "Увага!", "Дану дію додано до списку.");
            return;
        }
        $scope.updateObject(objectID, newObjectName, newParentGroupID, newObjectDescription, isMove);
    };

    //Підготовка об'єкта до переміщення
    $rootScope.prepareObjectToMove = function (objectID, objectName, newObjectName, newObjectDescription, newParentGroupID, userID, currentUserID) {
        if (userID != currentUserID) {
            $rootScope.saveAction('edit', 'object', objectID, objectName, newObjectName, newObjectDescription, newParentGroupID, currentUserID);
            alert("Дану дію додано до списку.");
            return;
        }
        $scope.updateObject(objectID, newObjectName, newParentGroupID, newObjectDescription, 1, 1);
    };

    //Оновлення об'єкта
    $scope.updateObject = function(objectID, objectName, groupID, objectDescription, isMove, reloadEditView){
        var params =  {
            objectID: objectID,
            objectName: objectName,
            groupID: groupID,
            objectDescription: objectDescription,
            isMove: isMove
        };
        ObjectsModel.update({'id':JSON.stringify(params)}, function(res){
            console.log("Об'єкт оновлено!");
            console.log(res);
            if(reloadEditView){
                alert("Дію успішно виконано. Об'єкт оновлено.");
                $rootScope.getTree();
            }
            else{
                showMessageWindow("alert alert-success", "Об'єкт оновлено!", "Дію успішно виконано. Об'єкт оновлено.");
            }
        }, function (err) {
            console.log("Об'єкт не оновлено!");
            console.log(err);
            if(reloadEditView) {
                alert("Не вдалося оновити об'єкт.");
            }
            else{
                showMessageWindow("alert alert-danger", "Помилка!", "Не вдалося оновити об'єкт.");
            }
        });
    };

    //ВИДАЛЕННЯ ОБ'ЄКТА
    //Підготовка до видалення об'єкта
    $scope.prepareObjectToRemove = function (objectID, objectName, parentGroupID, userID, currentUserID, reloadEditView) {
        var answer = confirm("Ви дійсно бажаєте видалити об'єкт? ");
        if (answer === true) {
            if (userID != currentUserID) {
                $rootScope.saveAction('remove', 'object', objectID, objectName, null, null, parentGroupID, currentUserID);
                alert("Дану дію додано до списку.");
                return;
            }
            $scope.removeObject(objectID, reloadEditView);
        }
    };

    //Видалення об'єкта
    $scope.removeObject = function(objectID, reloadEditView){
        var params = objectID;
        ObjectsModel.delete({id: params}, function (res) {
            console.log("Об'єкт видалено!");
            console.log(res);
            if(reloadEditView){
                $rootScope.getTree();
            }
            else {
                $rootScope.getAllObjects();
            }
        }, function (err) {
            console.log("Об'єкт не видалено!");
            console.log(err);
            alert("Не вдалося видалити об'єкт.");
        });
    };
    /**
    КІНЕЦЬ БЛОКУ МАНІПУЛЯЦІЇ ОБ'ЄКТАМИ
    **/

    /**
    БЛОК ФІЛЬТРУ ДЛЯ ОБ'ЄКТІВ
    **/
    //Фільтр пошуку об'єктів на головній сторінці
    $scope.previousSearchText = '';
    $scope.objectsFilter = function (obj) {
        if($scope.searchText) {
            if($scope.previousSearchText != $scope.searchText) {
                $rootScope.$pagination.page = 1;
                $scope.previousSearchText = $scope.searchText;
            }
            if (obj.name.toLowerCase().indexOf($scope.searchText.toLowerCase()) + 1) {
                return true;
            }
            if (obj.user.toLowerCase().indexOf($scope.searchText.toLowerCase()) + 1) {
                return true;
            }
            if (obj.path.toLowerCase().indexOf($scope.searchText.toLowerCase()) + 1) {
                return true;
            }
            for (var i = 0; i < obj.indicators.length; i++) {
                if (obj.indicators[i].name.toLowerCase().indexOf($scope.searchText.toLowerCase()) + 1) {
                    return true;
                }
            }
            return false;
        }
        else{
            return true;
        }
    };
    /**
    КІНЕЦЬ БЛОКУ ФІЛЬТРІВ ДЛЯ ОБ'ЄКТІВ
    **/
}]);