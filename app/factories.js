mainApp.factory('IOModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8030/api/io.php/params/:id', {'id':'@id'}, {
        'export' : {method: 'GET'},
        'import': {method: 'POST'},
        'setRoot' : {method: 'PUT'}
    });
}]);

mainApp.factory('ObjectsModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8030/api/objects.php/params/:id', {'id':'@id'}, {
        'create' : {method: 'POST'},
        'update': {method: 'PUT'}
    });
}]);

mainApp.factory('IndicatorsModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8030/api/indicators.php/params/:id', {'id':'@id'}, {
        'create' : {method: 'POST'},
        'update': {method: 'PUT'}
    });
}]);

mainApp.factory('GroupsModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8030/api/groups.php/params/:id', {'id':'@id'}, {
        'create' : {method: 'POST'},
        'update': {method: 'PUT'}
    });
}]);

mainApp.factory('AuthModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8030/api/auth.php/auth/:id', {'id':'@id'}, {
        'login': {method: 'PUT'}
    });
}]);

mainApp.factory('ActionModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8030/api/actions.php/params/:id', {'id':'@id'}, {
        'set': {method: 'PUT'}
    });
}]);

mainApp.factory('jwtInterceptor', ['$rootScope', '$q', function ($rootScope, $q) {
    return {
        request: function (config) {
            var token = window.localStorage.getItem('authToken');
            config.headers = config.headers || {};
            if (token != 'undefined' && angular.isDefined(token)) {
                config.headers.Authorization = 'Bearer ' + token;
            }
            return config;
        },
        response: function (response) {
            if (response.status === 401) {
                // handle the case where the user is not authenticated
            }
            return response || $q.when(response);
        }
    };
}]);