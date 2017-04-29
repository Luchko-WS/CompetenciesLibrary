mainApp.filter('formatLargeIconFilter', function(){
    return function(value) {
        switch (value) {
            case 'Clear':
                return 'assets/img/sun.jpg';
            case 'Sun':
                return 'assets/img/sun.jpg';
            case 'Rain':
                return 'assets/img/rain.jpg';
            case 'Snow':
                return 'assets/img/snow.jpg';
            case 'Extreme':
                return 'assets/img/extreme.jpg';
            case 'Clouds':
                return 'assets/img/cloudy.jpg';
            default:
                //icon-small
                //icon-sun
                //icon-cloudy
                return 'icon-small';
        }
    }
});

mainApp.filter('formatIconFilter', function(){
    return function(value) {
        switch (value) {
            case 'Sun':
                return 'icon-clear';
            case 'Rain':
                return 'icon-rain';
            case  'Snow':
                return 'icon-snowflake';
            case 'Extreme':
                return 'icon-cloud';
            default:
                //icon-small
                //icon-sun
                //icon-cloudy
                return 'icon-small';
        }
    }
});

mainApp.filter('formaShortDateFilter', function(){
    return function(value) {
        var theDate = new Date(value * 1000);
        return theDate.getDate() + '.' + (theDate.getMonth() + 1);
    }
});

mainApp.filter('formatDayOfWeekFilter', function(){
    return function(value) {
        var theDate = new Date(value*1000);

        switch (theDate.getDay()) {
            case 1:
                return 'Пн';
            case 2:
                return 'Вт';
            case 3:
                return 'Ср';
            case 4:
                return 'Чт';
            case 5:
                return 'Пт';
            case 6:
                return 'Сб';
            case 0:
                return 'Нд';
        }
    }
});