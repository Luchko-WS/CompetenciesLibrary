function dateToFormatString(value, targetFormat, oldFormat) {

    var dd, mm, yyyy;

    if(oldFormat === undefined) {
        var theDate = new Date(value);
        dd = theDate.getDate(), mm = theDate.getMonth() + 1, yyyy = theDate.getFullYear();
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
    }
    else {
        var array;
        switch (oldFormat){
            case 'yyyy-mm-dd':
                array = value.split('-');
                dd = array[2], mm = array[1], yyyy = array[0];
                break;
            case 'dd.mm.yyyy':
                array = value.split('.');
                dd = array[0], mm = array[1], yyyy = array[2];
                break;
            default:
                return value;
        }
    }

    switch (targetFormat) {
        case 'yyyy-mm-dd':
            return yyyy + '-' + mm + '-' + dd;
        case 'dd.mm.yyyy':
        default:
            return dd + '.' + mm + '.' + yyyy;

    }
};

function getDayOfWeek(value) {
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
};