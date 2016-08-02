mainApp.controller('ActionsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'ActionModel',
    function ($scope, $rootScope, $http, $location, $routeParams, ActionModel) {
        $scope.actionData = null;
        $scope.oldActionsID = null;

        $scope.getAllActions = function () {

            $("#toggleButton").click(function () {
                $("#toggleBox").slideToggle("normal");
            });

            var params =  {
                actionID: 'ALL_ACTIONS'
            };

            ActionModel.get({'id':JSON.stringify(params)}, function (res) {
                if(res.data === undefined) {
                    console.log('ERROR');
                    $scope.actionData = -1;
                }
                else {
                    $scope.actionData = res.data;

                    $rootScope.$countOfActions = '';
                    $scope.oldActionsID = $rootScope.$user.lastActionID;
                    if($scope.actionData.length != 0) {
                        $rootScope.$user.lastActionID = $scope.actionData[$scope.actionData.length - 1].id;
                        $rootScope.setLastActionIDForUser($scope.actionData[$scope.actionData.length - 1].id);
                    }
                    window.localStorage.setItem('authUser', JSON.stringify($rootScope.$user));
                }
            });
        };

        $scope.getAction = function (actionID) {
            $scope.actionData = null;

            var params =  {
                actionID: actionID
            };
            ActionModel.get({'id':JSON.stringify(params)}, function (res) {
                if(res.data === undefined) {
                    console.log('ERROR');
                    $scope.actionData = -1
                }
                else {
                    $scope.actionData = res.data;
                    if($scope.actionData[0].item_id == -1) {
                        $location.path('/actions/id/' + $scope.actionData[0].id + '/' +
                            $scope.actionData[0].item_type + '/' + $scope.actionData[0].action_type);
                    }
                    else {
                        $location.path('/actions/id/' + $scope.actionData[0].id + '/' +
                            $scope.actionData[0].item_type + '/' + $scope.actionData[0].item_id +
                            '/' + $scope.actionData[0].action_type);
                    }
                }
            });
        };

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
                console.log(res);
            });
        };

        $scope.removeAction = function (actionID) {
            var params = actionID;
            var answer = confirm("Ви дійсно бажаєте видалити дію? ");
            if (answer === true) {
                ActionModel.delete({id: params}, function (res) {
                    console.log(res);
                    $scope.getAllActions();
                });
            }
        };

        $scope.rejectOrAcceptTheAction = function (actionID, state) {
            var params =  {
                actionID: actionID,
                state: state
            };
            ActionModel.set({'id':JSON.stringify(params)}, function(res){
                console.log(res);
                $scope.actionData[0].state = state;
                //$scope.getAction(actionID);
            }, function (res) {
                console.log(res);
            });

        };

        $scope.preparePageForAction = function () {
            if($routeParams.id) {
                $scope.getAction($routeParams.id);
            }
            else {/*error*/}
        };

        $scope.getActionID = function () {
            return $routeParams.id;
        };

        $scope.getItemID = function(){
            return $routeParams.itemID;
        };

        $scope.returnItemName = function () {
            return $scope.actionData[0].item_name;
        };

        ////////////////////////
        $scope.allActionsTab = 'active';
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

        $scope.setAllActionsTab = function () {
            if($scope.allActionsTab != 'active'){
                $scope.allActionsTab = 'active';
                $scope.myActionsTab = 'notActive';
            }
        };

        $scope.setMyActionsTab = function () {
            if($scope.myActionsTab != 'active'){
                $scope.myActionsTab = 'active';
                $scope.allActionsTab = 'notActive';
            }
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

            if (obj.item_name.toLowerCase().indexOf($scope.filterParam.name.toLowerCase()) + 1) {
                return true;
            }
            else if (obj.path.toLowerCase().indexOf($scope.filterParam.name.toLowerCase()) + 1) {
                return true;
            }
            else if (obj.user.toLowerCase().indexOf($scope.filterParam.name.toLowerCase()) + 1) {
                return true;
            }
            else {
                return false;
            }

            return true;
        }
}]);