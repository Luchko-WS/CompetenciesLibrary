mainApp.controller('MainCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'IOModel',
    'GroupsModel', 'SkillsModel', 'IndicatorsModel',
    function ($scope, $rootScope, $http, $location, $routeParams, IOModel,
              GroupsModel, SkillsModel, IndicatorsModel) {

    //Об'єкт, що зберігає параметри посторінкової навігації
    //Використовується на головній сторінці
    $rootScope.$pagination = {};
    //Обчислення кількості сторінок
    $rootScope.pageCount = function (count) {
        if(count < $rootScope.$pagination.pageSize)
        {
            return 1;
        }
        else {
            if (count % $rootScope.$pagination.pageSize != 0) {
                return Math.floor(count / $rootScope.$pagination.pageSize) + 1;
            }
            else {
                return count / $rootScope.$pagination.pageSize;
            }
        }
    };

    $rootScope.validatePageInput = function(pageNumber, itemCount) {
        var pageCount = $rootScope.pageCount(itemCount);
        if(pageNumber > pageCount){
            $rootScope.$pagination.page = pageCount;
            $rootScope.$pagination.pageSearch = pageCount;
        }
        else{
            $rootScope.$pagination.page = pageNumber;
        }
    };

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
        setTimeout("$('#messageBox').hide('slow')", 5000);
    }
    //Кнопка закриття повідомлення
    $("#closeMessageBoxButton").click(function () {
        $('#messageBox').fadeOut("slow");
    });
    /**
     КІНЕЦЬ БЛОКУ ІНТЕРФЕЙСУ
     **/

    /**
    БЛОК ЕКСПОРТУ/ІМПОРТУ ДАНИХ
    **/
    //Змінна показу прогресу експорту файлу
    $scope.showProgress = false;
    //Змінна типу готового експортованого файлу
    $rootScope.readyForDownloadFile = null;

    //Експорт даних у файл
    $scope.exportAllData = function (format, id) {
        $rootScope.readyForDownloadFile = null;
        var params =  {
            format: format,
            id: id
        };
        IOModel.export({'id':JSON.stringify(params)}, function (res) {
            switch (format){
                case "XLS":
                    $rootScope.readyForDownloadFile = 'xlsFileIsReadyForDownload';
                    break;
                case "JSON":
                    $rootScope.readyForDownloadFile = 'jsonFileIsReadyForDownload';
                    break;
            }
            $location.path("/download");
        }, function (err) {

        });
    };

    //Імпорт даних з файлу в систему
    var stepImport = 0;
    $scope.importData = function (parent) {
        if(parent.user_id != $rootScope.$user.id && parent.node_level != 1) {
            showMessageWindow("alert alert-danger", "Не можливо обрати дану групу!",
                "Ви можете імпортувати дані у групи, що належать Вам. Дана група належить іншому користувачеві!");
            return;
        }

        var root = $scope.uploadData[0];
        var rootId = null;
        var rootLevel = $scope.uploadData[0].node_level;
        stepImport = 0;
        root.user_id = $rootScope.$user.id;

        if(root.node_type == 0)
        {
            var params = {
                root: root,
                parent: parent
            };
            IOModel.setRoot({'id':JSON.stringify(params)}, function(res){
                rootId = res.id;

                var stackLevels = [Number(rootLevel)];
                var stackParents = [Number(rootId)];


                $('.progress').show();
                $('#uploadStatus').show();

                var node_id = Number(rootId);
                updateImportProgress(++stepImport);
                for(var i = 1; i < $scope.uploadData.length; i++) {

                    $scope.uploadData[i].user_id = $rootScope.$user.id;
                    node_id++;
                    if(Number($scope.uploadData[i].node_level) > (stackLevels[0] + 1)){
                        stackLevels.unshift(stackLevels[0] + 1);
                        stackParents.unshift(node_id - 1);
                    }
                    else if(Number($scope.uploadData[i].node_level) < (stackLevels[0] + 1)) {
                        while(Number($scope.uploadData[i].node_level) < (stackLevels[0] + 1)) {
                            stackLevels.shift();
                            stackParents.shift();
                        }
                    }
                    if(!$scope.saveItemOnServerDB(stackParents[0], $scope.uploadData[i], node_id)) {
                        showMessageWindow("alert alert-danger", "Не вдалося здійснити імпорт файлу!",
                            "Не вдалося імпортувати дані: { id = " + $scope.uploadData[i].id +
                            ", name = " + $scope.uploadData[i].name + ", node_type = " + $scope.uploadData[i].node_type + " }!");
                        return;
                    }
                }
            }, function(err){
                showMessageWindow("alert alert-danger", "Не вдалося здійснити імпорт файлу!",
                    "Не вдалося отримати батьківський вузол для імпортованих даних!");
                return;
            });
        }
    };

    $scope.saveItemOnServerDB = function(parent_id, item, current_id) {
        if(item.node_type != null) {
            if(item.node_type == 0) {
                //save group
                var params =  {
                    groupName: item.name,
                    parentGroupID: parent_id,
                    groupDescription: item.description,
                    userID: item.user_id
                };
                GroupsModel.create(params, function(res){
                    console.log("Групу створено!");
                    console.log(res);
                    updateImportProgress(++stepImport);
                    return true;
                },function (err) {
                    console.log("Групу не створено!");
                    console.log(err);
                    updateImportProgress(++stepImport);
                    return true;
                });
            }
            else if(item.node_type == 1) {
                //save skill
                var params =  {
                    skillName: item.name,
                    groupID: parent_id,
                    skillDescription: item.description,
                    userID: item.user_id
                };
                console.log("CREATE");
                SkillsModel.create(params, function(res){
                    console.log("Компетенцію створено!");
                    console.log(res);
                    updateImportProgress(++stepImport);
                    return true;
                }, function (err) {
                    console.log("Компетенцію не створено!");
                    console.log(err);
                    updateImportProgress(++stepImport);
                    return true;
                });
                for (var i = 0; i < item.indicators.length; i++) {
                    if(!$scope.saveItemOnServerDB(current_id, item.indicators[i])){
                        return true;
                    }                }
            }
        }
        else {
            var params =  {
                indicatorName: item.name,
                indicatorDescription: item.description,
                skillID: parent_id,
                userID: item.user_id
            };
            IndicatorsModel.create(params, function(res){
                console.log("Індикатор створено!");
                console.log(res);
                return true;
            }, function (err) {
                console.log("Індикатор не створено!");
                console.log(err);
                return false;
            });
        }
    };

    function updateImportProgress() {
        var percentLoaded = Math.round((stepImport / $scope.uploadData.length) * 100);
        if (percentLoaded < 100) {
            $('#progressBar').css('width', function () {
                return percentLoaded + '%';
            });
            $('#progressBar').text(percentLoaded + '%');
        }
        else {
            showMessageWindow("alert alert-success", "Імпорт завершено",
                "Усі дані успішно імпортовано! Через 5 с. Вас буде автоматично перенаправлено до редактору бібліотеки.");

            $('#uploadStatus').hide();
            $('#progressBar').css({'width' : '100%'});
            $('#progressBar').text('100%');
            $('#uploadStatus').hide();
            setTimeout("$('.progress').hide('slow')", 3000);
            $('#selectGroup').hide('slow');

            setTimeout(function(){
                window.location.href = '#/editLibrary';
            }, 5000);
        }
    }

    /**ДЛЯ ЗЧИТУВАННЯ ФАЙЛУ**/
    var reader;
    //Встановлення прослуховувачів
    var dropZone = document.getElementById('drop_zone');
    var files = document.getElementById('files');
    if(dropZone && files) {
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);
        files.addEventListener('change', handleFileSelect, false);
    }

    //ІНТЕРФЕЙС
    $('#cancelUpload').click(function () {
        reader.abort();
        $('#cancelUpload').hide();
    });
    $('#cancelImportFileButton').click(function () {
        $('#selectGroup').hide('slow');
        $('#selectFile').show('slow');
        $('#list').text('Файл не обрано');
    });

    //ХЕНДЛИ
    //Хендл обробника помилок
    function errorHandler(evt) {
        switch(evt.target.error.code) {
            case evt.target.error.NOT_FOUND_ERR:
                showMessageWindow("alert alert-danger", "Не вдалося прочитати файл!",
                    "Файл не знайдено!");
                break;
            case evt.target.error.NOT_READABLE_ERR:
                showMessageWindow("alert alert-danger", "Не вдалося прочитати файл!",
                    "Не можливо прочитати файл!");
                break;
            //case evt.target.error.ABORT_ERR:
            //    break;
            default:
                showMessageWindow("alert alert-danger", "Не вдалося прочитати файл!",
                    "Виникла помилка при зчитуванні даного файлу!");
        };
    }
    function updateProgress(evt) {
        // evt is an ProgressEvent.
        if (evt.lengthComputable) {
            var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
            if (percentLoaded < 100) {
                $('#progressBar').css('width', function () {
                    return percentLoaded + '%';
                });
                $('#progressBar').text(percentLoaded + '%');
            }
        }
    }
    function validateUploadData(){
        for(var i = 0; i < $scope.uploadData.length; i++) {
            if ($scope.uploadData[i].name == null || $scope.uploadData[i].name.length == 0) {
                alert("Імпортовані дані не валідні! " +
                    "Елемент #" + i + " не містить поле назви!");
                return false;
            }

            if ($scope.uploadData[i].node_type == null || ($scope.uploadData[i].node_type != 0 && $scope.uploadData[i].node_type != 1)) {
                alert("Імпортовані дані не валідні! " +
                    "Елемент #" + i + " є елементом невідомого типу!");
                return false;
            }

            if ($scope.uploadData[i].node_type == 1) {
                if ($scope.uploadData[i].indicators == null) {
                    alert("Імпортовані дані не валідні! " +
                        "Компетенція #" + i + " " + $scope.uploadData[i].name + " не містить поле індикаторів!");
                    return false;
                }
                for (var j = 0; j < $scope.uploadData[i].indicators.length; j++) {
                    if ($scope.uploadData[i].indicators[j].name == null || $scope.uploadData[i].indicators[j].name.length == 0) {
                        alert("Імпортовані дані не валідні! " +
                            "Індикатор компетенції #" + i + " " + $scope.uploadData[i].name + " не містить поле назви!");
                        return false;
                    }
                }
            }
        }

        var rootLevel = $scope.uploadData[0].node_level;
        var stackLevels = [Number(rootLevel)];

        for(var i = 1; i < $scope.uploadData.length; i++) {

            if($scope.uploadData[i].node_level == rootLevel){
                alert("Імпортовані дані не валідні! " +
                    "В імпортованих даних не може бути більше одного кореневого вузла! Вузол #" + i + " " +
                    $scope.uploadData[i].name + " також є кореневим!");
                return false;
            }

            if(Number($scope.uploadData[i].node_level) > (stackLevels[0] + 1)){
                if((Number($scope.uploadData[i].node_level) - (stackLevels[0] + 1)) > 1) {
                    alert("Імпортовані дані не валідні! " +
                        "Пропущено батьківський вузол для вузла #" + i + " " +
                        $scope.uploadData[i].name + "!");
                    return false;
                }
                stackLevels.unshift(stackLevels[0] + 1);

            }
            else if(Number($scope.uploadData[i].node_level) < (stackLevels[0] + 1)) {
                while(Number($scope.uploadData[i].node_level) < (stackLevels[0] + 1)) {
                    stackLevels.shift();
                }
            }
        }

        return true;
    }

    function handleFileSelect(evt) {
       //Встановлюємо початок прогресу зчитування
        $('#progressBar').css({'width' : '0%'});
        $('#progressBar').text('0%');
        $scope.uploadData = null;
        $('#boxWithTree').hide('slow');

        reader = new FileReader();
        $scope.uploadData = null;
        reader.onerror = errorHandler;
        reader.onprogress = updateProgress;
        reader.onabort = function(e) {
            setTimeout("$('#messageBox').hide('slow')", 3000);
            $('#cancelUpload').hide();
            $('#uploadStatus').hide();
            setTimeout("$('.progress').hide('slow')", 3000);
            setTimeout("$('#selectFile').show('slow')", 3000);
            $('#list').text('Файл не обрано');
        };
        reader.onloadstart = function(e) {
            $('#selectFile').hide('slow');
            $('.progress').show();
            $('#cancelUpload').show();
            $('#uploadStatus').show();
        };
        reader.onload = function(e) {

            $('#progressBar').css({'width' : '100%'});
            $('#progressBar').text('100%');
            $('#uploadStatus').hide();
            $('#cancelUpload').hide();
            $scope.uploadData = JSON.parse(reader.result);

            if(!validateUploadData()){
                $scope.uploadData = null;
                setTimeout("$('#selectFile').show('slow')", 3000);
                $('#list').text('Файл не обрано');

            }
            else {
                setTimeout("$('#selectGroup').show('slow')", 3000);
            }

            setTimeout("$('.progress').hide('slow')", 3000);
        };

        if(!evt.dataTransfer){
            reader.readAsText(evt.target.files[0]);
            $('#list').text(evt.target.files[0].name);
        }
        else{
            if(evt.dataTransfer.files[0].name.substr(evt.dataTransfer.files[0].name.length - 4, 4) == "json") {
                evt.stopPropagation();
                evt.preventDefault();
                $('#list').text(evt.dataTransfer.files[0].name);
                reader.readAsText(evt.dataTransfer.files[0]);
            }
            else {
                return;
            }
        }
    }
    //Переміщення файлу курсором в зону копіювання
    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
    }
}]);

