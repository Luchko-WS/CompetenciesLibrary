mainApp.factory('IOModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/io.php/params/:id', {'id':'@id'}, {
        'update': {method: 'PUT'}
    });
}]);

mainApp.factory('SkillsModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/skills.php/params/:id', {'id':'@id'}, {
        'create' : {method: 'POST'},
        'update': {method: 'PUT'}
    });
}]);

mainApp.factory('IndicatorsModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/indicators.php/params/:id', {'id':'@id'}, {
        'create' : {method: 'POST'},
        'update': {method: 'PUT'}
    });
}]);

mainApp.factory('GroupsModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/groups.php/params/:id', {'id':'@id'}, {
        'create' : {method: 'POST'},
        'update': {method: 'PUT'}
    });
}]);

mainApp.factory('AuthModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/auth.php/auth/:id', {'id':'@id'}, {
        'login': {method: 'PUT'}
    });
}]);

mainApp.factory('ActionModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/actions.php/params/:id', {'id':'@id'}, {
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