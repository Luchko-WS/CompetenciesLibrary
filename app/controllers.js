var CityInputName;
mainApp.controller('RequestCtrl', ['$scope', 'RequestModel', function ($scope, RequestModel) {

    $scope.data;
    $scope.cityName;

    $scope.getData = function () {
        DataFromAPI = 'empty';
        CityInputName = $scope.cityName;
        RequestModel.get({'city':$scope.cityName}, function (res) {
            if(res.data === undefined)
                DataFromAPI = 'null';
            else
                DataFromAPI = res.data;
        });
    };

    /*
    $scope.drawChart = function(){
        if(DataFromAPI != 'empty') {
            var chart = c3.generate({
                data: {
                    x: 'x',
                    columns: [
                        ['x', dateToFormatString(DataFromAPI.list[0].dt * 1000, 'yyyy-mm-dd'),
                            dateToFormatString(DataFromAPI.list[1].dt * 1000, 'yyyy-mm-dd'),
                            dateToFormatString(DataFromAPI.list[2].dt * 1000, 'yyyy-mm-dd'),
                            dateToFormatString(DataFromAPI.list[3].dt * 1000, 'yyyy-mm-dd'),
                            dateToFormatString(DataFromAPI.list[4].dt * 1000, 'yyyy-mm-dd'),
                            dateToFormatString(DataFromAPI.list[5].dt * 1000, 'yyyy-mm-dd'),
                            dateToFormatString(DataFromAPI.list[6].dt * 1000, 'yyyy-mm-dd')],
                        ['Температура', DataFromAPI.list[0].temp.day, DataFromAPI.list[1].temp.day,
                            DataFromAPI.list[2].temp.day, DataFromAPI.list[3].temp.day,
                            DataFromAPI.list[4].temp.day, DataFromAPI.list[5].temp.day,
                            DataFromAPI.list[6].temp.day],
                    ],
                    types: {
                        'Температура': 'area'
                    }
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: '%d.%m'
                            //'%d.%m.%Y'
                        }
                    }
                }
            });
        }
    };
    */

    $scope.returnInputCityName = function(){
        return CityInputName;
    };

    $scope.returnData = function() {
        $scope.data = DataFromAPI;
    };
}]);


mainApp.controller('DataBaseCtrl', ['$scope', '$http', 'PostModel', function ($scope, $http, PostModel) {

    $scope.data;
    $scope.date1;
    $scope.date2;
    $scope.buttonName = 'Показати інструменти';

    $scope.changeButtonName = function () {
        if($scope.buttonName == 'Показати інструменти')
            $scope.buttonName = 'Приховати інструменти';
        else
            $scope.buttonName = 'Показати інструменти';
    };

    $scope.setParameters = function (cityName) {

        if(cityName === undefined || cityName === '')
            cityName = 'ALL';

        if($scope.date1 === undefined || $scope.date1 == '')
            $scope.date1 = '01.01.2016';

        if($scope.date2 === undefined || $scope.date2 == '') {
            var theDate = new Date();
            theDate.setMonth(theDate.getMonth()+1);
            $scope.date2 = dateToFormatString(theDate, 'dd.mm.yyyy');
        }

        Parameters.cityName = cityName;
        Parameters.minDate = dateToFormatString($scope.date1, 'yyyy-mm-dd', 'dd.mm.yyyy');
        Parameters.maxDate = dateToFormatString($scope.date2, 'yyyy-mm-dd', 'dd.mm.yyyy');
    };

    $(function () {
        //Ініціалізація datetimepickerMin и datetimepickerMax
        $("#dateTimePickerMin").datetimepicker(
            {pickTime: false, language: 'ru'}
        );
        $("#dateTimePickerMax").datetimepicker(
            {pickTime: false, language: 'ru'}
        );
        //При зміні дати в min datetimepicker
        $("#dateTimePickerMin").on("dp.change",function (e) {
            $scope.date1 = e.date;
            $scope.date1 = dateToFormatString($scope.date1, 'dd.mm.yyyy');
            $("#dateTimePickerMax").data('DateTimePicker').setMinDate(e.date);
        });
        //При зміні дати в max datetimepicker
        $("#dateTimePickerMax").on("dp.change",function (e) {
            $scope.date2 = e.date;
            $scope.date2 = dateToFormatString($scope.date2, 'dd.mm.yyyy');
            $("#dateTimePickerMin").data("DateTimePicker").setMaxDate(e.date);
        });
    });

    $scope.getData = function () {
        DataFromDB = 'empty';
        PostModel.get({'id':JSON.stringify(Parameters)}, function (res) {
            DataFromDB = res.data;
        });
    };

    $scope.saveData = function (value) {

        var obj = value;
        obj.inputCityName = CityInputName;
        obj.convertDate = [0,0,0,0,0,0,0];
        obj.convertDay = [0,0,0,0,0,0,0];
        for(var i=0; i<7; i++){
            obj.convertDay[i] = getDayOfWeek(value.list[i].dt);
            obj.convertDate[i] = dateToFormatString(value.list[i].dt*1000, 'yyyy-mm-dd');
        }

        PostModel.save(value, function(res){
            console.log(res);
        });
        alert('Дані збережено!');
    };

    $scope.deleteData = function(value){

        var answer = confirm("Ви дійсно бажаєте видалити усі дані? ");
        if (answer === true) {
            PostModel.delete(function (res) {
                console.log(res);
            });
            alert('Дані видалено!');
        }
    };

    $scope.returnData = function() {
        $scope.data = DataFromDB;
    };

}]);