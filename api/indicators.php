<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require 'vendor/autoload.php';
require 'db.php';
require 'PHPExcel.php';

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

$app->get('/params/{id}', function (Request $request, Response $response, $args) {

    $input = json_decode($args['id'], true);

    file_put_contents('INDICATORS.txt', $input["indicatorId"]);

    $rowIndicators = DB::fetchAll("SELECT * FROM indicators WHERE id="
        .$input['indicatorId'].";");
    $rowsSkills[0]['indicators'] = $rowIndicators;

    $response->getBody()->write('{"data":'.json_encode($rowsSkills).'}');
    return $response;
});

$app->post('/params', function (Request $request, Response $response, $args) {
    $input = $request->getParsedBody();

    $skillId = $input['skillId'];
    $indicatorId = $input['indicatorId'];
    $indicatorName = $input['indicatorName'];
    $indicatorDescription = $input['indicatorDescription'];

    //редагування індикатору
    if ($indicatorId != -1) {

        $sql = "UPDATE indicators SET indicator_name='".$indicatorName.
            "', description='".$indicatorDescription.
            "', skill_id=".$skillId." WHERE id=".$indicatorId.";";

        file_put_contents('indicator.txt', $sql);

        DB::exec($sql);
    }
    //створення індикатору
    else {
        $sql = "INSERT INTO indicators (skill_id, indicator_name, description)".
          "VALUES (".$skillId.", '".$indicatorName."', '".$indicatorDescription."');";
        DB::exec($sql);
    }

    return $this->response->withJson($input);
});

$app->delete('/params/[{id}]', function (Request $request, Response $response, $args) {
    $input = $request->getAttribute('id');
    $id = $input;

    $sql = "DELETE FROM indicators WHERE id=".$id.";";
    DB::exec($sql);

    return $this->response->true;
});

$app->run();
