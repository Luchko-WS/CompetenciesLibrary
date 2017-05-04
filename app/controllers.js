mainApp.controller('MainCtrl', ['$scope', 'RestModel', function ($scope, RestModel) {

    $scope.data = 'empty';
    $scope.edit_mode = MODE_NO_EDIT;

    $scope.nameText = "";
    $scope.groupText = "";
    $scope.descriptionText = "";

    $scope.setGlobalEditParams = function (par_skill, par_indicator, par_group, par_mode) {
        globalEditParams.skill = par_skill;
        globalEditParams.indicator = par_indicator;
        globalEditParams.group = par_group;
        globalEditParams.edit_mode = par_mode;
    }

    $scope.getAllData = function () {

        var params =  {
            skill: 'ALL_SKILLS',
            indicator: 'ALL_INDICATORS'
        };

        RestModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                $scope.skills = 'empty';
                $scope.indicators = 'empty';
                console.log('ERROR IN GET ALL DATA');
            }
            else {
                $scope.data = res.data;
            }
        })
    };

    $scope.getSkill = function () {

        var params =  {
            skill: globalEditParams.skill,
            indicator: globalEditParams.indicator
        };

        console.log(params);

        RestModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                $scope.skills = 'empty';
                $scope.indicators = 'empty';
                console.log('ERROR IN GET SKILL');
            }
            else {
                $scope.data = res.data;
                $scope.nameText = res.data[0].skill_name;
                $scope.groupText = res.data[0].node_level;
                $scope.descriptionText = res.data[0].description;
            }
        })
    };

    $scope.getIndicator = function () {

        var params =  {
            skill: globalEditParams.skill,
            indicator: globalEditParams.indicator
        };

        console.log(params);

        RestModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                $scope.skills = 'empty';
                $scope.indicators = 'empty';
                console.log('ERROR IN GET INDICATOR');
            }
            else {
                $scope.data = res.data;
                $scope.nameText = res.data[0].indicators[0].indicator_name;
                $scope.groupText = res.data[0].indicators[0].skill_id;
                $scope.descriptionText = res.data[0].indicators[0].description;

                console.log('DONE INDICATOR');
                console.log(res.data);
            }
        })
    };

    $scope.saveSkill = function(nameValue, groupValue, descriptionValue, skillId){

        var value =  {
            obj: "SKILL",
            skillId: skillId,
            skillName: nameValue,
            skillGroup: groupValue, /*переміщення в іншу групу. потрібно отримати правий ключ і рівень*/
            skillDescription: descriptionValue
        };

        console.log("SAVE SKILL");
        console.log(value);

        if (skillId === undefined) {
            RestModel.save(value, function(res){
                console.log(res);
            });
        }
         else {
            //RestModel.update(value, function(res){
            RestModel.save(value, function(res){
                console.log(res);
            });
        }

        alert("Data is overwriten!");
    };

    $scope.saveIndicator = function(nameValue, skillIdValue, descriptionValue, indicatorId){

        var value =  {
            obj: "INDICATOR",
            skillId: skillIdValue, /*переміщення в іншу компетенцію. потрібно отримати ідентифікатор*/
            indicatorName: nameValue,
            indicatorId: indicatorId,
            indicatorDescription: descriptionValue
        };

        console.log("SAVE INDICATOR");
        console.log(value);

        if (indicatorId === undefined) {
            RestModel.save(value, function(res){
                console.log(res);
            });
        }
        else {
            //RestModel.update(value, function(res){
            RestModel.save(value, function(res){
                console.log(res);
            });
        }

        alert("Data is overwriten!");
    };

    /*$scope.removeSkill = function (value){
     var r = confirm("Are you sure delete this ? ");
     var obj = new parametersSrv(value);
     if (r === true) {
     obj.$delete(function (res) {
     getAll();
     console.log('res: ', res);
     alert('Delete Data Success');
     });
     } else {
     getAll();
     }
     };*/


    $scope.getGlobalEditMode = function () {

        $scope.edit_mode =  globalEditParams.edit_mode;
        //globalEditParams.skill = par_skill;
        //globalEditParams.indicator = par_indicator;
        //globalEditParams.group = par_group;
        console.log("Params:");
        console.log(globalEditParams);
    };

}]);

mainApp.controller('EditCtrl', ['$scope', '$http', 'PostModel', function ($scope, $http, EditModel) {


}]);