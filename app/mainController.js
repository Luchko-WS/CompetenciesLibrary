mainApp.controller('MainCtrl', ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'IOModel',
    function ($scope, $rootScope, $http, $location, $routeParams, IOModel) {

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

    $scope.test = function (group) {
        //console.log(group.id);
        console.log(JSON.parse($scope.uploadData));
        /*if(group.id) {
            $scope.importData(group.id);
        }*/
    };

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
    $scope.importData = function (id) {
        var params = {
            itemID: id,
            data: JSON.parse($scope.uploadData)
        };
        console.log(params);
        IOModel.import(params, function (res) {
           console.log(res);
           showMessageWindow("alert alert-success", "Дані імпортовано!", "Дію успішно виконано. Дані імпортовано.");
        }, function (err) {
            console.log(err);
            showMessageWindow("alert alert-danger", "Дані не імпортовано!", "Виникла помилка при виконанні операції. Дані не імпортовано.");
        });
    };

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
                alert("Файл не знайдено!");
                break;
            case evt.target.error.NOT_READABLE_ERR:
                alert("Не можливо прочитати файл!");
                break;
            case evt.target.error.ABORT_ERR:
                break;
            default:
                alert("Виникла помилка при зчитуванні даного файлу!");
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
    function handleFileSelect(evt) {
       //Встановлюємо початок прогресу зчитування
        $('#progressBar').css({'width' : '0%'});
        $('#progressBar').text('0%');
        $scope.uploadData = null;
        $('#boxWithTree').hide('slow');

        reader = new FileReader();
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
            setTimeout("$('.progress').hide('slow')", 3000);
            $scope.uploadData = reader.result;
            setTimeout("$('#selectGroup').show('slow')", 3000);
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

