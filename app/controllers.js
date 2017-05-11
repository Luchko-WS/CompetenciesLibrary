mainApp.controller('MainCtrl', ['$scope', 'RestModel', function ($scope, RestModel) {

    $scope.data = 'empty';

    $scope.tree = 'empty';
    $scope.currentGroup = 'empty';
    $scope.skills = 'empty';
    $scope.currentSkill = 'empty';

    $scope.nameText = "";
    $scope.groupText = "";
    $scope.descriptionText = "";

    $scope.setGlobalEditParams = function (par_skill, par_indicator, par_group, par_mode) {
        globalEditParams.skill = par_skill;
        globalEditParams.indicator = par_indicator;
        globalEditParams.group = par_group;
        globalEditParams.edit_mode = par_mode;
    };

    $scope.getGlobalEditMode = function () {
        return globalEditParams.edit_mode;
    };

    $scope.getGlobalSkillId = function () {
        return globalEditParams.skill;
    };

    $scope.getGroupTree = function () {
        var params =  {
            skill: 'NONE',
            indicator: 'NONE',
            exportToFile: 'NONE',
            tree: 'GROUPS'
        };

        RestModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET GROUP TREE');
            }
            else {
                $scope.tree = res.data;
            }
        });
    };

    $scope.getCurrentGroup = function (left_key, right_key, level) {
        for(var i = 0; i < $scope.tree.length; i++){
            if(Number($scope.tree[i].node_level) == (level-1) &&
                Number($scope.tree[i].left_key) < left_key && Number($scope.tree[i].right_key) > right_key){
                return $scope.tree[i];
            }
        }
    };

    $scope.getSkillList = function () {
        var params =  {
            skill: 'NONE',
            indicator: 'NONE',
            exportToFile: 'NONE',
            tree: 'SKILLS'
        };

        RestModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET SKILL LIST');
            }
            else {
                $scope.skills = res.data;
            }
        });
    };

    $scope.getCurrentSkill = function (id) {
        for(var i = 0; i < $scope.skills.length; i++){
            if($scope.skills[i].id == id){
                return $scope.skills[i];
            }
        }
    };

    $scope.getAllData = function () {

        var params =  {
            skill: 'ALL_SKILLS',
            indicator: 'ALL_INDICATORS',
            exportToFile: 'NONE',
            tree: 'NONE'
        };

        RestModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET ALL DATA');
            }
            else {
                $scope.data = res.data.rows;
            }
        });
    };

    $scope.getSkill = function () {

        var params =  {
            skill: globalEditParams.skill,
            indicator: globalEditParams.indicator,
            exportToFile: 'NONE',
            tree: 'NONE'
        };

        RestModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET SKILL');
            }
            else {
                $scope.data = res.data;
                $scope.nameText = res.data[0].skill_name;
                $scope.currentGroup = $scope.getCurrentGroup($scope.data[0].left_key,
                    $scope.data[0].right_key, $scope.data[0].node_level);
                $scope.groupText = $scope.currentGroup.skill_name;
                $scope.descriptionText = res.data[0].description;
            }
        });
    };

    $scope.getIndicator = function () {

        var params =  {
            skill: globalEditParams.skill,
            indicator: globalEditParams.indicator,
            exportToFile: 'NONE',
            tree: 'NONE'
        };

        RestModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET INDICATOR');
            }
            else {
                $scope.data = res.data;
                $scope.nameText = res.data[0].indicators[0].indicator_name;
                $scope.currentSkill = $scope.getCurrentSkill(res.data[0].id);
                $scope.groupText = $scope.currentSkill.skill_name;
                $scope.descriptionText = res.data[0].indicators[0].description;
            }
        })
    };

    $scope.createNewSkill = function () {

    };

    $scope.saveSkill = function(nameValue, groupRightKeyValue, groupLevelValue, descriptionValue, skillId){

        var value =  {
            obj: "SKILL",
            skillId: skillId,
            skillName: nameValue,
            groupRightKey: groupRightKeyValue,
            groupLevel: groupLevelValue,
            skillDescription: descriptionValue
        };

        RestModel.save(value, function(res){
            console.log(res);
       });

        alert("Data is overwriten!");
    };

    $scope.saveIndicator = function(nameValue, skillIdValue, descriptionValue, indicatorId){

        var value =  {
            obj: "INDICATOR",
            skillId: skillIdValue,
            indicatorName: nameValue,
            indicatorId: indicatorId,
            indicatorDescription: descriptionValue
        };

        console.log("SAVE INDICATOR");

        RestModel.save(value, function(res){
            console.log(res);
        });

        alert("Data is overwriten!");
    };

    $scope.removeSkill = function(skillId){

        var params = [skillId, "SKILL"];

        var answer = confirm("Ви дійсно бажаєте видалити компетенцію? ");
        if (answer === true) {
            RestModel.delete({id:params}, function (res) {
                console.log(res);
            });
            alert('Компетенцію видалено!');
            $scope.getAllData();
        }
    };

    $scope.removeIndicator = function(indicatorId){

        var params = [indicatorId, "INDICATOR"];

        var answer = confirm("Ви дійсно бажаєте видалити індикатор? ");
        if (answer === true) {
            RestModel.delete({id:params}, function (res) {
                console.log(res);
            });
            alert('Індикатор видалено!');
            $scope.getSkill();
        }
    };

    $scope.exportAllData = function (format) {
        var params =  {
            exportToFile: format,
            skill: 'ALL_SKILLS',
            indicator: 'ALL_INDICATORS',
            tree: 'NONE'
        };

        RestModel.get({'id':JSON.stringify(params)}, function (res) {
            alert("Export data!");
        });
    };

    $scope.saveAdditionalData = function (value) {
        additionalData = value;
    };

    $scope.getAdditionalData = function () {
        return additionalData;
    };

    /*
    function staticDataSource(openedParentData, callback) {
        var childNodesArray = [
            { "name": "Ascending and Descending", "type": "folder" },
            { "name": "Sky and Water I", "type": "item" },
            { "name": "Drawing Hands", "type": "folder" },
            { "name": "waterfall", "type": "item" },
            { "name": "Belvedere", "type": "folder" },
            { "name": "Relativity", "type": "item" },
            { "name": "House of Stairs", "type": "folder" },
            { "name": "Convex and Concave", "type": "item" }
        ];

        callback({
            data: childNodesArray
        });
    };

    $(function() {
        $('#myTree').tree({
            dataSource: staticDataSource,
            multiSelect: false,
            folderSelect: true
        });
    });
    */

}]);
