mainApp.controller('MainCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'IOModel', function ($scope, $rootScope, $http, $location, $routeParams, IOModel) {
    $rootScope.$tree;
    $rootScope.$currentGroup;

    $rootScope.$page = 0;
    $rootScope.$pageView = true;

    $rootScope.setPage = function (page) {
        $scope.$page = page;
    };

    $scope.xlsFileIsReadyForDownload = false;
    $scope.jsonFileIsReadyForDownload = false;

    $scope.exportAllData = function (format, id) {
        var params =  {
            format: format,
            id: id
        };

        IOModel.get({'id':JSON.stringify(params)}, function (res) {
            switch (format){
                case "XLS":
                    $scope.xlsFileIsReadyForDownload = true;
                    break;
                case "JSON":
                    $scope.jsonFileIsReadyForDownload = true;
                    break;
            }
            alert("Export data!");
            console.log($scope.jsonFileIsReadyForDownload);
        });
    };


}]);