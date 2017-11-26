<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require 'vendor/autoload.php';
require 'db.php';
require 'PHPExcel.php';

DB::init('mysql:dbname=prozorro;host=127.0.0.1;port=3306', 'root', 'WhiteShark28021995');

$app = new \Slim\App;

$app->options('/{routes:.+}', function (Request $request, Response $response, $args) {
    return $response;
});

$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});

//file_put_contents(filename, body);
//Отримання індикатору
$app->get('/params/{id}', function (Request $request, Response $response, $args) {
    $input = json_decode($args['id'], true);
    $id = $input['indicatorID'];
    $rowIndicator = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id=i.user_id)<>0, ".
        "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id=i.user_id), \"невідомий\") AS user ".
        "FROM indicators i WHERE id = $id;");
    $response->getBody()->write('{"data":'.json_encode($rowIndicator).'}');
    return $response;
});

//Створення індикатору
$app->post('/params', function (Request $request, Response $response, $args) {
    date_default_timezone_set('Europe/Kiev');
    $now = date("d.m.y G:i");

    $input = $request->getParsedBody();
    $skillId = $input['skillID'];
    $indicatorName = $input['indicatorName'];
    $indicatorDescription = $input['indicatorDescription'];
    $userID = $input['userID'];
    $sql = "INSERT INTO indicators (skill_id, name, description, user_id, creation_date) ".
      "VALUES ($skillId, '$indicatorName', '$indicatorDescription', $userID, '$now');";
    DB::exec($sql);
    return $this->response->withJson($input);
});

//Редагування індикатору
$app->put('/params/{id}', function (Request $request, Response $response, $args) {
    $input = json_decode($args['id'], true);
    $skillID = $input['skillID'];
    $indicatorID = $input['indicatorID'];
    $indicatorName = $input['indicatorName'];
    $indicatorDescription = $input['indicatorDescription'];
    $sql = "UPDATE indicators SET name = '$indicatorName', ".
        "description = '$indicatorDescription', skill_id = $skillID WHERE id = $indicatorID;";
    DB::exec($sql);
    return $this->response->withJson($input);
});

//Видалення індикатору
$app->delete('/params/[{id}]', function (Request $request, Response $response, $args) {
    $input = $request->getAttribute('id');
    $id = $input;
    $sql = "DELETE FROM indicators WHERE id = $id;";
    DB::exec($sql);
    //видалення дій над даним індикатором
    $sql = "DELETE FROM actions WHERE item_id = $id;";
    DB::exec($sql);
    return $this->response->true;
});

$app->run();
