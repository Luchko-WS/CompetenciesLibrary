<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require 'vendor/autoload.php';
require 'db.php';

DB::init('mysql:dbname=prozorro;host=127.0.0.1;port=3306', 'root', 'WhiteShark28021995');

$app = new \Slim\App;

$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});
/*
$app->get('/params/{id}', function (Request $request, Response $response, $args) {

    $input = json_decode($args['id'], true);

    if($input["cityName"]=="ALL")
        $rows = DB::fetchAll("SELECT c.id, c.city, w.date, w.dayOfWeek, w.weather, w.temp 
FROM cities AS c RIGHT JOIN weather AS w ON (c.id=w.id) 
WHERE date >= '".$input["minDate"]."' AND date <= '".$input["maxDate"]."';");
    else
        $rows = DB::fetchAll("SELECT c.id, c.city, w.date, w.dayOfWeek, w.weather, w.temp 
FROM cities AS c RIGHT JOIN weather AS w ON (c.id=w.id) 
WHERE city = '".$input["cityName"]."' AND date >= '".$input["minDate"]."' AND date <= '".$input["maxDate"]."';");

    $response->getBody()->write('{"data":'.json_encode($rows).'}');
    return $response;
});

$app->post('/main', function ($request, $response, $args) {
    $input = $request->getParsedBody();

    $cityID = $input['city']['id'];
    $cityName = $input['inputCityName'];

    //перевіряємо чи є таке місто
    $rows = DB::fetchAll("SELECT COUNT(*) FROM cities WHERE cityID=".$cityID.";");
    //якщо немає
    if($rows[0]["COUNT(*)"] == 0) {
        $sql = "INSERT INTO cities (city, cityID) VALUES ('".$cityName."', '".$cityID."');";
        $params = DB::exec($sql);
    }
    //якщо є, то оновлюємо його назву
    else{
        $sql = "UPDATE cities SET city='".$cityName."' WHERE  cityID=".$cityID.";";
        $params = DB::exec($sql);
    }

    //отримуємо ідентифікатор міста SELECT id FROM cities WHERE city='London'
    $rows = DB::fetchAll("SELECT id FROM cities WHERE city='".$cityName."'");
    $id = $rows[0]['id'];

    //записуємо прогноз
    for($i=0; $i<7; $i++){

        $weather = $input['list'][$i]['weather'][0]['main'];
        $dayOfWeek = $input['convertDay'][$i];
        $date = $input['convertDate'][$i];
        $temp = $input['list'][$i]['temp']['day'];

        //перевіряємо, чи є запис з такою датою
        $rows = DB::fetchAll("SELECT COUNT(*) FROM weather WHERE id=".$id." AND date='".$date."';");

        //якщо немає, то додаємо
        if($rows[0]["COUNT(*)"] == 0) {
            $sql = "INSERT INTO weather (id, date, dayOfWeek, weather, temp) 
VALUES ('" . $id . "', '" . $date . "', '" . $dayOfWeek . "', '" . $weather . "', '" . $temp . "');";
            $params = DB::exec($sql);
        }
        //якщо є, то оновлюємо
        else {
            $sql = "UPDATE weather SET weather='".$weather."', temp='".$temp."' WHERE  id=".$id." AND date='".$date."';";
            $params = DB::exec($sql);
        }
    }
    //file_put_contents('log.txt', $sql);

    return $this->response->withJson($input);
});

$app->delete('/params', function ($request, $response, $args) {
    $input = $request->getParsedBody();

    $sql = "DELETE FROM weather WHERE id > 0;";
    $params = DB::exec($sql);
    //

    return $this->response->true;
});
*/

$app->get('/params/{id}', function (Request $request, Response $response, $args) {

    $input = json_decode($args['id'], true);
    //file_put_contents('request.txt', $input['indicator']);

    if($input["skill"] == "ALL_SKILLS" && $input['indicator'] == 'ALL_INDICATORS') {
        $rowsSkills = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type=1;");
        $rowsIndicators = DB::fetchAll("SELECT * FROM indicators");

        $response->getBody()->write('{"skills":'.json_encode($rowsSkills).',
            "indicators":'.json_encode($rowsIndicators).'}');
        return $response;
    }
});

/*
$app->get('/main/{city}', function (Request $request, Response $response, $args) {
    header('Content-Type: text/html;charset=UTF-8');
    $city = $args['city'];
    $url = "http://api.openweathermap.org/data/2.5/forecast/daily?q=".$args['city']."&units=metric&cnt=7&APPID=531d4a54f4acb25f72b62eab815bc362";
    $data = @file_get_contents($url);

    if($data)
        $response = '{"data":'.$data.'}';
    else
        $response = 'Not found!';
    return $response;
});*/

$app->run();