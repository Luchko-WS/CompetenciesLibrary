mainApp.controller('ActionsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'ActionModel',
    function ($scope, $rootScope, $http, $location, $routeParams, ActionModel) {

        $scope.actionData = null;

        $scope.getAllActions = function () {
            //$scope.actionData = null;

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
                }
            });
        };

        $scope.getActionsAfterID = function () {
            /*
            var params =  {
                actionID: 'ALL_ACTIONS'
            };

            ActionModel.get({'id':JSON.stringify(params)}, function (res) {
                if(res.data === undefined) {
                    console.log('ERROR');
                }
                else {
                    $scope.actionData = res.data;
                }
            });
            */
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
            });
            $scope.getAllActions();
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
}]);