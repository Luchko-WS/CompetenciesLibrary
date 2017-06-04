mainApp.controller('UserCtrl', ['$scope', 'IOModel', function ($scope, IOModel) {

    $scope.user = null;
    $scope.buttonText = "Log in";

    $scope.logIn = function () {
        if($scope.user == null) {
            $scope.user = 0;
            $scope.buttonText = "Log out";
        }
        else{
            $scope.user = null;
            $scope.buttonText = "Log in";
        }
    };

    $scope.getUserId = function () {
        return $scope.user;
    };
}]);
