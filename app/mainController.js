mainApp.controller('MainCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'IOModel', function ($scope, $rootScope, $http, $location, $routeParams, IOModel) {
    $rootScope.$tree;
    $rootScope.$currentGroup;

    $scope.showProgress = false;

    $rootScope.$page = 0;
    $rootScope.$pageView = true;

    $rootScope.setPage = function (page) {
        $scope.$page = page;
    };

    $rootScope.xlsFileIsReadyForDownload = false;
    $rootScope.jsonFileIsReadyForDownload = false;

    $scope.exportAllData = function (format, id) {
        var params =  {
            format: format,
            id: id
        };

        IOModel.export({'id':JSON.stringify(params)}, function (res) {
            switch (format){
                case "XLS":
                    $rootScope.xlsFileIsReadyForDownload = true;
                    break;
                case "JSON":
                    $rootScope.jsonFileIsReadyForDownload = true;
                    break;
            }
            $location.path("/download");
        });
    };

    $scope.importData = function (id) {
        var params = {id: id};

        IOModel.import({'id': JSON.stringify(params)}, function (res) {

        });
    };

}]);