mainApp.controller('MainCtrl', ['$scope', 'RequestModel', function ($scope, RequestModel) {

    $scope.skills = 'empty';
    $scope.indicators = 'empty';

    $scope.getAllData = function () {

        var params =  {
            skill: 'ALL_SKILLS',
            indicator: 'ALL_INDICATORS'
        };

        console.log(params);

        RequestModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.skills === undefined) {
                $scope.skills = 'empty';
                $scope.indicators = 'empty';
                console.log('ERROR');
            }
            else {
                $scope.skills = res.skills;
                $scope.indicators = res.indicators;
                console.log('DONE');
                console.log(res.skills);
                console.log(res.indicators);
            }
        })
    }
}]);

mainApp.controller('EditCtrl', ['$scope', '$http', 'PostModel', function ($scope, $http, EditModel) {


}]);