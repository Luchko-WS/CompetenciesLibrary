mainApp.factory('PostModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/rest.php/params/:id', {'id':'@id'}, {
        'update': {method: 'PUT'}
    });
}]);

mainApp.factory('RequestModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/rest.php/sendRequest/:city', {'city':'@city'}, {});
}]);