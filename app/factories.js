mainApp.factory('MainModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/main.php/params/:id', {'id':'@id'}, {
        'update': {method: 'PUT'}
    });
}]);

mainApp.factory('SkillsModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/skills.php/params/:id', {'id':'@id'}, {
        'update': {method: 'PUT'}
    });
}]);

mainApp.factory('IndicatorsModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/indicators.php/params/:id', {'id':'@id'}, {
        'update': {method: 'PUT'}
    });
}]);

mainApp.factory('GroupsModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/groups.php/params/:id', {'id':'@id'}, {
        'update': {method: 'PUT'}
    });
}]);

mainApp.factory('IOModel', ['$resource', function ($resource) {
    return $resource('http://localhost:8088/api/main.php/systemIO/:id', {'id':'@id'}, {});
}]);