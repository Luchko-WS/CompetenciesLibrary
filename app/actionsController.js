mainApp.controller('ActionsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'ActionModel',
    function ($scope, $rootScope, $http, $location, $routeParams, ActionModel) {

    //Змінна даних дії
    $scope.actionData = null;
    //Змінна для збереження ID останньої дії попереднього сеансу
    //Викорисовується для відображення нових дій
    $scope.oldActionsID = null;

    /**
     БЛОК РОБОТИ З ПАРАМЕТРАМИ АДРЕСНОГО РЯДКА
     **/
    //По ID дії знаходиться потрібна сторінка
    $scope.preparePageForAction = function () {
        if($routeParams.id) {
            $scope.getAction($routeParams.id);
        }
    };
    $scope.getActionID = function () {
        return $routeParams.id;
    };

    $scope.getItemID = function(){
        return $routeParams.itemID;
    };
    /**
     КІНЕЦЬ БЛОКУ РОБОТИ З ПАРАМЕТРАМИ АДРЕСНОГО РЯДКА
     **/

    /**
     БЛОК ІНТЕРФЕЙСУ
     **/
    //Приховати/відобразити блок з фільтрами
    $("#actionToggleButton").click(function () {
        $("#actionToggleBox").slideToggle("normal");
    });

    //Вкладки
    $scope.allActionsTab = 'active';
    $scope.setAllActionsTab = function () {
        if($scope.allActionsTab != 'active'){
            $scope.allActionsTab = 'active';
            $scope.newActionsTab = 'notActive';
            $scope.myActionsTab = 'notActive';
        }
    };
    $scope.setNewActionsTab = function () {
        if($scope.newActionsTab != 'active'){
            $scope.allActionsTab = 'notActive';
            $scope.newActionsTab = 'active';
            $scope.myActionsTab = 'notActive';
        }
    };
    $scope.setMyActionsTab = function () {
        if($scope.myActionsTab != 'active'){
            $scope.allActionsTab = 'notActive';
            $scope.newActionsTab = 'notActive';
            $scope.myActionsTab = 'active';
        }
    };
    /**
     КІНЕЦЬ БЛОКУ ІНТЕРФЕЙСУ
     **/

    /**
     БЛОК МАНІПУЛЯЦІЇ ДІЯМИ
     **/
    //GETTERS
    //Отримання всіх дій
    $rootScope.getAllActions = function () {
        console.log("params: ", $rootScope.$user.firstActionID);
        var params =  {
            actionID: 'ALL_ACTIONS',
            //Відображення дій після тих, що були видалені користувачем
            firstActionID: $rootScope.$user.firstActionID
        };
        ActionModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('Не вдалося отримати усі дії! (res.data === undefined)');
                $scope.actionData = -1;
            }
            else {
                $scope.actionData = res.data;
                console.log($scope.actionData);
                $rootScope.$countOfActions = '';
                $scope.oldActionsID = $rootScope.$user.lastActionID;
                console.log("last: ", $scope.oldActionsID);
                if($scope.actionData.length != 0) {
                    if(Number($scope.actionData[0].id) > Number($scope.oldActionsID)) {
                        console.log($scope.actionData[0].id, ">", $scope.oldActionsID);
                        $rootScope.$user.lastActionID = $scope.actionData[0].id;
                        $rootScope.setLastActionIDForUser($scope.actionData[0].id);
                        window.localStorage.setItem('authUser', JSON.stringify($rootScope.$user));
                    }
                }
            }
        }, function (err) {
            console.log('Не вдалося отримати усі дії! (res.data === undefined)');
            console.log(err);
        });
    };

    //Отримання дії
    $scope.getAction = function (actionID) {
        $scope.actionData = null;
        var params =  {
            actionID: actionID
        };
        ActionModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('Не вдалося отримати дію! (res.data === undefined)');
                $scope.actionData = -1
            }
            else {
                $scope.actionData = res.data;
                //Перехід до потрібної сторінки відповідно до дії
                if($scope.actionData[0].action_type == 'create') {
                    $location.path('/actions/id/' + $scope.actionData[0].id + '/' +
                        $scope.actionData[0].item_type + '/' + $scope.actionData[0].action_type);
                }
                else {
                    $location.path('/actions/id/' + $scope.actionData[0].id + '/' +
                        $scope.actionData[0].item_type + '/' + $scope.actionData[0].item_id +
                        '/' + $scope.actionData[0].action_type);
                }
            }
        }, function (err) {
            console.log('Не вдалося отримати усі дію!');
            console.log(err);
        });
    };

    //Збереження дії
    $rootScope.saveAction = function (actionType, itemType, itemID, itemName, newItemName, newItemDescription, newParentID, userID) {
        var params =  {
            actionType: actionType,
            itemType: itemType,
            itemID: itemID,
            itemName: itemName,
            newItemName: newItemName,
            newItemDescription: newItemDescription,
            newParentID: newParentID,
            userID: userID
        };
        ActionModel.save(params, function(res){
            console.log('Дію збережено');
            console.log(res);
        }, function (err) {
            console.log('Дію не збережено');
            console.log(err);
        });
    };

    //Скасування/прийняття дії
    $scope.rejectOrAcceptTheAction = function (actionID, state) {
        var params =  {
            actionID: actionID,
            state: state
        };
        ActionModel.set({'id':JSON.stringify(params)}, function(res){
            console.log('Дію оновлено');
            console.log(res);
            $scope.actionData[0].state = state;
        }, function (err) {
            console.log('Дію не оновлено');
            console.log(err);
            alert('Не вдалось прийняти/скасувати дію');
        });
    };

    //Видалення дії
    $scope.removeAction = function (actionID) {
        var params = actionID;
        var answer = confirm("Ви дійсно бажаєте видалити дію? ");
        if (answer === true) {
            ActionModel.delete({id: params}, function (res) {
                console.log('Дію видалено');
                console.log(res);
                $rootScope.getAllActions();
            },function (err) {
                console.log('Дію не видалено');
                console.log(err);
                alert("Увага! Не вдалося видалити дію!");
            });
        }
    };
    /**
     КІНЕЦЬ БЛОКУ МАНІПУЛЯЦІЇ ДІЯМИ
     **/

    /**
     БЛОК ФІЛЬТРІВ ДЛЯ ДІЙ
     **/
    $scope.filterParam = {
        waitingActions : true,
        acceptedActions : true,
        rejectedActions : true,
        createActions : true,
        copyActions : true,
        editActions : true,
        removeActions : true,
        name : '',
        skillObject : true,
        groupObject : true,
        indicatorObject : true
    };

    $scope.actionsFilter = function (obj) {
        if(!$scope.filterParam.waitingActions && obj.state == 0){
            return false;
        }
        if(!$scope.filterParam.acceptedActions && obj.state == 1){
            return false;
        }
        if(!$scope.filterParam.rejectedActions && obj.state == -1){
            return false;
        }

        if(!$scope.filterParam.createActions && obj.action_type == 'create'){
            return false;
        }
        if(!$scope.filterParam.copyActions && obj.action_type == 'copy'){
            return false;
        }
        if(!$scope.filterParam.editActions && obj.action_type == 'edit'){
            return false;
        }
        if(!$scope.filterParam.removeActions && obj.action_type == 'remove'){
            return false;
        }

        if(!$scope.filterParam.skillObject && obj.item_type == 'skill'){
            return false;
        }
        if(!$scope.filterParam.groupObject && obj.item_type == 'group'){
            return false;
        }
        if(!$scope.filterParam.indicatorObject && obj.item_type == 'indicator'){
            return false;
        }

        if($scope.myActionsTab == 'active' && obj.user_id != $rootScope.$user.id) {
            return false;
        }
        if($scope.newActionsTab == 'active' && (obj.id <= $scope.oldActionsID || obj.user_id == $rootScope.$user.id)){
            return false;
        }

        if(obj.item_name.toLowerCase().indexOf($scope.filterParam.name.toLowerCase()) + 1) {
            return true;
        }
        else if(obj.user.toLowerCase().indexOf($scope.filterParam.name.toLowerCase()) + 1) {
            return true;
        }
        else {
            return false;
        }

        return true;
    };
    /**
     КІНЕЦЬ БЛОКУ ФІЛЬТРІВ ДЛЯ ДІЙ
     **/
}]);