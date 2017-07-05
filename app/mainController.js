mainApp.controller('MainCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'IOModel', function ($scope, $rootScope, $http, $location, $routeParams, IOModel) {

    $rootScope.$id;
    $rootScope.$edit_mode;

    $rootScope.$tree;
    $rootScope.$currentGroup;

    $rootScope.$page = 0;
    $rootScope.$pageView = true;

    $rootScope.setPage = function (page) {
        $scope.$page = page;
    };

    $scope.setCreateMode = function () {
        $rootScope.editMode = 'create';
    };

    $scope.exportAllData = function (format) {
        var params =  {
            exportToFile: format,
            skill: 'ALL_SKILLS',
            indicator: 'ALL_INDICATORS',
        };

        IOModel.get({'id':JSON.stringify(params)}, function (res) {
            alert("Export data!");
        });
    };

    $scope.changeButtonTextSelectFromTree = function(flag){
        if(flag){
            return "Select node";
        }
        else {
            return "SelectFromTree";
        }
    };

    $scope.saveAdditionalData = function (value) {
        additionalData = value;
    };

    $scope.getAdditionalData = function () {
        return additionalData;
    };
}]);