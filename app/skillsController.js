mainApp.controller('SkillsCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'SkillsModel',
    function ($scope, $rootScope, $http, $location, $routeParams, SkillsModel) {

    //Змінна даних компетенції
    $scope.skillData = null;
    //Змінні форми (моделі)
    $scope.nameText = null;
    $scope.groupText = null;
    $scope.descriptionText = null;
    //Змінна для збереження попередньої батьківської групи
    //(для перевірки чи відбувається переміщення)
    $scope.oldGroupID = null;

    /**
    БЛОК РОБОТИ З ПАРАМЕТРАМИ АДРЕСНОГО РЯДКА
    **/
    $scope.getRouteParamSkillID_SkillCtrl = function () {
        return $routeParams.id;
    };
    /**
    КІНЕЦЬ БЛОКУ РОБОТИ З ПАРАМЕТРАМИ АДРЕСНОГО РЯДКА
    **/

    /**
    БЛОК ІНТЕРФЕЙСУ
    **/
    //ПОВІДОМЛЕННЯ
    $scope.messageBoxClass = null;
    $scope.messageTitleText = null;
    $scope.messageText = null;
    //Виведення повідомлення
    function showMessageWindow(messageClass, messageTittle, messageBody) {
        $scope.messageTitleText = messageTittle;
        $scope.messageText = messageBody;
        $scope.messageBoxClass = messageClass;
        $('#messageBox').fadeIn("slow");
    }
    //Кнопка закриття повідомлення
    $("#closeMessageBoxButton").click(function () {
        $('#messageBox').fadeOut("slow");
    });

    //Вибір групи з дерева
    $scope.show = false;
    $scope.onClickSelectCurrentGroup = function(isHide){
        if(isHide){
            return "Обрати групу";
        }
        else {
            if($rootScope.$currentGroup!=null) {
                $scope.groupText = $rootScope.$currentGroup.name;
            }
            return "Обрати групу з дерева";
        }
    };
    /**
    КІНЕЦЬ БЛОКУ ІНТЕРФЕЙСУ
    **/

    /**
    БЛОК МАНІПУЛЯЦІЇ КОМПЕТЕНЦІЯМИ
    **/
    //GETTERS
    //Отримання всіх компетенцій
    $rootScope.getAllSkills = function () {
        //Якщо на панелі обрана група, то потрібно отримати компетенції цієї групи
        if($rootScope.$currentGroup){
            $scope.getSkillsByGroup($rootScope.$currentGroup.id);
        }
        else
        {
            $scope.skillData = null;
            $rootScope.$currentGroup = null;
            var params = {
                skillID: 'ALL_SKILLS'
            };
            SkillsModel.get({'id': JSON.stringify(params)}, function (res) {
                if (res.data === undefined) {
                    console.log('Не вдалося отримати усі компетенції! (res.data === undefined)');
                    $scope.skillData = -1;
                }
                else {
                    $scope.skillData = res.data.rows;
                }
            }, function (err) {
                console.log("Не вдалося отримати усі компетенції!");
                console.log(err);
                $scope.skillData = -1;
            });
        }
    };

    //Отримання компетенцій по групі
    $rootScope.getSkillsByGroup = function (groupID) {
        $scope.skillData = null;
        var params =  {
            skillID: 'BY_GROUP',
            groupID: groupID
        };
        SkillsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('Не вдалося отримати компетенції даної групи! (res.data === undefined)');
                $scope.skillData = -1;
            }
            else {
                $scope.skillData = res.data.rows;
            }
        }, function (err) {
            console.log("Не вдалося отримати компетенції даної групи!");
            console.log(err);
            $scope.skillData = -1;
        });
    };

    //Отримання компетнції
    $rootScope.getSkill = function (skillID, setDataIntoForm) {
        $scope.skillData = null;
        $rootScope.$currentGroup = null;
        $scope.oldGroupID = null;
        var params =  {
            skillID: skillID
        };
        SkillsModel.get({'id':JSON.stringify(params)}, function (res) {
            if(res.data === undefined) {
                console.log('Не вдалося отримати компетенцію! (res.data === undefined)');
                $scope.skillData = -1;
            }
            else {
                $scope.skillData = res.data;
                if(setDataIntoForm) {
                    $scope.nameText = $scope.skillData[0].name;
                    $rootScope.$currentGroup = $scope.skillData[0].parent_node;
                    $scope.groupText = $rootScope.$currentGroup.name;
                    $scope.oldGroupID = $rootScope.$currentGroup.id;
                    $scope.descriptionText = $scope.skillData[0].description;
                }
            }
        }, function (err) {
            console.log("Не вдалося отримати компетенцію!");
            console.log(err);
            $scope.skillData = -1;
        });
    };

    //СТВОРЕННЯ КОМПЕТЕНЦІЇ
    //Підготовка до створення компетенції
    $scope.prepareSkillToCreate = function (skillName, skillDescription, parentGroupID, parentGroupUserID, currentUserID) {
        if(!skillName || !parentGroupID){
            showMessageWindow("alert alert-danger", "Увага!", "Заповніть поля назви і групи!");
            return;
        }
        if (currentUserID != parentGroupUserID) {
            $rootScope.saveAction('create', 'skill', -1, skillName, null, skillDescription, parentGroupID, currentUserID);
            showMessageWindow("alert alert-info", "Увага!", "Дану дію додано до списку.");
            return;
        }
        $scope.createSkill(skillName, parentGroupID, skillDescription, currentUserID);
    };

    //Створення компетенції
    $scope.createSkill = function(skillName, groupID, skillDescription, userID){
        var params =  {
            skillName: skillName,
            groupID: groupID,
            skillDescription: skillDescription,
            userID: userID
        };
        SkillsModel.create(params, function(res){
            console.log("Компетенцію створено!");
            console.log(res);
            showMessageWindow("alert alert-success", "Увага!", "Дію успішно виконано. Компетенцію створено.");
        }, function (err) {
            console.log("Компетенцію не створено!");
            console.log(err);
            showMessageWindow("alert alert-danger", "Помилка!", "Не вдалося створити компетенцію.");
        });
    };

    //Підготовка до копіювання компетентності
    $rootScope.prepareSkillToCopy = function (skillID, skillName, skillDescription, parentGroupID, parentGroupUserID, currentUserID) {
        if (currentUserID != parentGroupUserID) {
            $rootScope.saveAction('copy', 'skill', skillID, skillName, null, skillDescription, parentGroupID, currentUserID);
            alert("Дану дію додано до списку.");
            return;
        }
        $scope.copySkill(skillID, skillName, parentGroupID, skillDescription, currentUserID);
    };

    //Копіювання компетенції
    $scope.copySkill = function(skillID, skillName, groupID, skillDescription, userID){
        var params =  {
            skillID: skillID,
            skillName: skillName,
            groupID: groupID,
            skillDescription: skillDescription,
            isCopy: true,
            userID: userID
        };
        SkillsModel.create(params, function(res){
            console.log("Компетенцію скопійовано!");
            console.log(res);
            alert("Дію успішно виконано. Компетенцію скопійовано.");
            $rootScope.getTree();
        }, function (err) {
            console.log("Компетенцію не скопійовано!");
            console.log(err);
            alert("Не вдалося скопіювати компетенцію.");
        });
    };

    //РЕДАГУВАННЯ КОМПЕТЕНЦІЇ
    //Підготовка компетенції до оновлення
    $scope.prepareSkillToUpdate = function (skillID, skillName, newSkillName, newSkillDescription, newParentGroupID, userID, currentUserID) {
        if(!skillName || !newParentGroupID){
            showMessageWindow("alert alert-danger", "Увага!", "Заповніть поля назви і групи!");
            return;
        }
        var isMove = false;
        if($scope.oldGroupID != newParentGroupID){
            isMove = true;
        }
        if (userID != currentUserID) {
            $rootScope.saveAction('edit', 'skill', skillID, skillName, newSkillName, newSkillDescription, newParentGroupID, currentUserID);
            showMessageWindow("alert alert-info", "Увага!", "Дану дію додано до списку.");
            return;
        }
        $scope.updateSkill(skillID, newSkillName, newParentGroupID, newSkillDescription, isMove);
    };

    //Підготовка компетенції до переміщення
    $rootScope.prepareSkillToMove = function (skillID, skillName, newSkillName, newSkillDescription, newParentGroupID, userID, currentUserID) {
        if (userID != currentUserID) {
            $rootScope.saveAction('edit', 'skill', skillID, skillName, newSkillName, newSkillDescription, newParentGroupID, currentUserID);
            alert("Дану дію додано до списку.");
            return;
        }
        $scope.updateSkill(skillID, newSkillName, newParentGroupID, newSkillDescription, 1, 1);
    };

    //Оновлення компетенції
    $scope.updateSkill = function(skillID, skillName, groupID, skillDescription, isMove, reloadEditView){
        var params =  {
            skillID: skillID,
            skillName: skillName,
            groupID: groupID,
            skillDescription: skillDescription,
            isMove: isMove
        };
        SkillsModel.update({'id':JSON.stringify(params)}, function(res){
            console.log("Компетенцію оновлено!");
            console.log(res);
            if(reloadEditView){
                alert("Дію успішно виконано. Компетенцію оновлено.");
                $rootScope.getTree();
            }
            else{
                showMessageWindow("alert alert-success", "Компетенцію оновлено!", "Дію успішно виконано. Компетенцію оновлено.");
            }
        }, function (err) {
            console.log("Компетенцію не оновлено!");
            console.log(err);
            if(reloadEditView) {
                alert("Не вдалося оновити компетенцію.");
            }
            else{
                showMessageWindow("alert alert-danger", "Помилка!", "Не вдалося оновити компетенцію.");
            }
        });
    };

    //ВИДАЛЕННЯ КОМПЕТЕНЦІЇ
    //Підготовка до видалення компетенції
    $scope.prepareSkillToRemove = function (skillID, skillName, parentGroupID, userID, currentUserID, reloadEditView) {
        var answer = confirm("Ви дійсно бажаєте видалити компетенцію? ");
        if (answer === true) {
            if (userID != currentUserID) {
                $rootScope.saveAction('remove', 'skill', skillID, skillName, null, null, parentGroupID, currentUserID);
                alert("Дану дію додано до списку.");
                return;
            }
            $scope.removeSkill(skillID, reloadEditView);
        }
    };

    //Видалення компетенції
    $scope.removeSkill = function(skillID, reloadEditView){
        var params = skillID;
        SkillsModel.delete({id: params}, function (res) {
            console.log("Компетенцію видалено!");
            console.log(res);
            if(reloadEditView){
                $rootScope.getTree();
            }
            else {
                $rootScope.getAllSkills();
            }
        }, function (err) {
            console.log("Компетенцію не видалено!");
            console.log(err);
            alert("Не вдалося видалити компетенцію.");
        });
    };
    /**
    КІНЕЦЬ БЛОКУ МАНІПУЛЯЦІЇ КОМПЕТЕНЦІЯМИ
    **/

    /**
    БЛОК ФІЛЬТРІВ ДЛЯ КОМПЕТЕНЦІЙ
    **/
    //Фільтр пошуку компетенцій на головній сторінці
    $scope.previousSearchText = '';
    $scope.skillsFilter = function (obj) {
        if($scope.searchText) {
            if($scope.previousSearchText != $scope.searchText) {
                $rootScope.$pagination.page = 1;
                $scope.previousSearchText = $scope.searchText;
            }
            if (obj.name.toLowerCase().indexOf($scope.searchText.toLowerCase()) + 1) {
                return true;
            }
            if (obj.user.toLowerCase().indexOf($scope.searchText.toLowerCase()) + 1) {
                return true;
            }
            if (obj.path.toLowerCase().indexOf($scope.searchText.toLowerCase()) + 1) {
                return true;
            }
            for (var i = 0; i < obj.indicators.length; i++) {
                if (obj.indicators[i].name.toLowerCase().indexOf($scope.searchText.toLowerCase()) + 1) {
                    return true;
                }
            }
            return false;
        }
        else{
            return true;
        }
    };
    /**
    КІНЕЦЬ БЛОКУ ФІЛЬТРІВ ДЛЯ КОМПЕТЕНЦІЙ
    **/
}]);