mainApp.controller('MainCtrl', ['$scope', 'IOModel', 'SkillsModel', 'IndicatorsModel', 'GroupsModel', function ($scope, IOModel, SkillsModel, IndicatorsModel, GroupsModel) {

    $scope.data = null;

    $scope.tree = null;
    $scope.currentGroup = null;
    $scope.skills = null;
    $scope.currentSkill = null;

    $scope.page = 0;
    $scope.pageView = true;

    $scope.nameText = "";
    $scope.groupText = "";
    $scope.descriptionText = "";

    $scope.setPage = function (page) {
        $scope.page = page;
    };

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

        GroupsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET GROUP TREE');
            }
            else {
                $scope.tree = res.data;
                $('#tree').treeview({data: formatDataToTree()});

                $('#tree').on('nodeSelected', function(event, data) {
                    $scope.currentGroup = data;
                    $scope.groupText = $scope.currentGroup.skill_name;
                });
            }
        });
    };

    function formatDataToTree() {

        var root = $scope.tree[0];
        root.text = $scope.tree[0].skill_name;
        root.node_id = 0;

        var indexMap = [0];
        var currentLevel = 2;

        for(var i = 1; i < $scope.tree.length; i++) {

            $scope.tree[i].node_id = i;
            $scope.tree[i].nodes = null;
            $scope.tree[i].text = $scope.tree[i].skill_name;
            if($scope.tree[i].node_level == 2){
                $scope.tree[i].parentId = indexMap[0];
            }
            else{
                if(currentLevel == $scope.tree[i].node_level){
                    $scope.tree[i].parentId = indexMap[$scope.tree[i].node_level - 2];
                }
                else if(currentLevel < $scope.tree[i].node_level){
                    if($scope.tree[i].node_level - 1 > indexMap.length){
                        indexMap.push(i-1);
                        $scope.tree[i].parentId = indexMap[$scope.tree[i].node_level - 2];
                        currentLevel = $scope.tree[i].node_level;
                    }
                    else{
                        indexMap[$scope.tree[i].node_level - 2] = i-1;
                        $scope.tree[i].parentId = indexMap[$scope.tree[i].node_level - 2];
                        currentLevel = $scope.tree[i].node_level;
                    }
                }
                else if(currentLevel > $scope.tree[i].node_level){
                    $scope.tree[i].parentId = indexMap[$scope.tree[i].node_level - 2];
                    currentLevel = $scope.tree[i].node_level;
                }
            }
        }

        var map = {}, node, roots = [];
        for (var i = 1; i < $scope.tree.length; i ++) {
            node = $scope.tree[i];
            node.nodes = null;
            map[node.node_id] = i;
            if (node.parentId !== 0) {
                if($scope.tree[map[node.parentId]].nodes == null) {
                    $scope.tree[map[node.parentId]].nodes = [];
                }
                $scope.tree[map[node.parentId]].nodes.push(node);
            } else {
                roots.push(node);
            }
        }

        root.nodes = roots;
        return [root];
    }

    $scope.getCurrentGroup = function (left_key, right_key, level) {

        if($scope.tree != null) {
            for (var i = 0; i < $scope.tree.length; i++) {
                if (Number($scope.tree[i].node_level) == (level - 1) &&
                    Number($scope.tree[i].left_key) < left_key && Number($scope.tree[i].right_key) > right_key) {
                    return $scope.tree[i];
                }
            }
        }
    };

    $scope.getAllSkills = function () {

        var params =  {
            skillId: 'ALL_SKILLS',
        };

        SkillsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET ALL SKILLS');
            }
            else {
                $scope.data = res.data.rows;
            }
        });
    };

    $scope.getSkillsByGroup = function (left_key, right_key) {
        var params =  {
            skillId: 'BY_GROUP',
            left_key: left_key,
            right_key: right_key,
        };

        SkillsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET SKILLS BY GROUP');
            }
            else {
                $scope.data = res.data.rows;
            }
        });
    };

    $scope.getSkill = function () {

        var params =  {
            skillId: globalEditParams.skill
        };

        SkillsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET SKILL');
            }
            else {
                $scope.data = res.data;
                $scope.nameText = res.data[0].skill_name;
                $scope.currentGroup = $scope.getCurrentGroup($scope.data[0].left_key,
                    $scope.data[0].right_key, $scope.data[0].node_level);
                if($scope.currentGroup != null) {
                    $scope.groupText = $scope.currentGroup.skill_name;
                }
                $scope.descriptionText = res.data[0].description;
            }
        });
    };

    $scope.getIndicator = function () {

        var params =  {
            indicatorId: globalEditParams.indicator
        };

        IndicatorsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET INDICATOR');
            }
            else {
                $scope.data = res.data;
                $scope.nameText = res.data[0].indicators[0].indicator_name;
                $scope.descriptionText = res.data[0].indicators[0].description;
            }
        })
    };

    $scope.getGroup = function () {

        var params =  {
            tree: false,
            groupId: globalEditParams.group
        };

        GroupsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('ERROR IN GET GROUP');
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

    $scope.saveGroup = function(nameValue, groupRightKeyValue, groupLevelValue, descriptionValue, groupId){

        var value =  {
            groupId: groupId,
            groupName: nameValue,
            groupRightKey: groupRightKeyValue,
            groupLevel: groupLevelValue,
            groupDescription: descriptionValue
        };

        GroupsModel.save(value, function(res){
            console.log(res);
       });

        alert("Групу збережено!");

        $scope.getAllSkills();
        $scope.getGroupTree();
    };

    $scope.saveSkill = function(nameValue, groupRightKeyValue, groupLevelValue, descriptionValue, skillId){

        var value =  {
            skillId: skillId,
            skillName: nameValue,
            groupRightKey: groupRightKeyValue,
            groupLevel: groupLevelValue,
            skillDescription: descriptionValue
        };

        SkillsModel.save(value, function(res){
            console.log(res);
        });

        alert("Компетенцію збережено!");

        $scope.getAllSkills();
    };

    $scope.saveIndicator = function(nameValue, skillIdValue, descriptionValue, indicatorId){

        var value =  {
            skillId: skillIdValue,
            indicatorName: nameValue,
            indicatorId: indicatorId,
            indicatorDescription: descriptionValue
        };

        IndicatorsModel.save(value, function(res){
            console.log(res);
        });

        alert("Індикатор збережено!");
    };

    $scope.removeSkill = function(skillId){

        var params = skillId;

        var answer = confirm("Ви дійсно бажаєте видалити компетенцію? ");
        if (answer === true) {
            SkillsModel.delete({id:params}, function (res) {
                console.log(res);
                $scope.getAllSkills();
            });
            alert('Компетенцію видалено!');

        }
    };

    $scope.removeGroup = function(groupId){

        var params = groupId;

        var answer = confirm("Ви дійсно бажаєте видалити групу? ");
        if (answer === true) {
            GroupsModel.delete({id:params}, function (res) {
                console.log(res);
                $scope.getAllSkills();
                $scope.getGroupTree();
            });
            alert('Групу видалено!');
        }
    };

    $scope.removeIndicator = function(indicatorId){

        var params = indicatorId;

        var answer = confirm("Ви дійсно бажаєте видалити індикатор? ");
        if (answer === true) {
            IndicatorsModel.delete({id:params}, function (res) {
                console.log(res);
                $scope.getSkill();
            });
            alert('Індикатор видалено!');
        }
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
