mainApp.factory('RestModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/rest.php/params/:id', {'id':'@id'}, {
        'update': {method: 'PUT'}
    });
}]);