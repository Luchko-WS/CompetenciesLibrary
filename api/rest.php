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

$app->get('/params/{id}', function (Request $request, Response $response, $args) {

    $input = json_decode($args['id'], true);
    //file_put_contents('request.txt', $input['indicator']);

    //отримуємо всі компетенції і їх критерії
    if($input["skill"] == "ALL_SKILLS" && $input['indicator'] == 'ALL_INDICATORS') {
        $rowsSkills = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type=1;");

        for($i = 0; $i < count($rowsSkills); $i++) {
            $rowIndicators = DB::fetchAll("SELECT * FROM indicators WHERE skill_id=".$rowsSkills[$i]['id']);
            $rowsSkills[$i]['indicators'] = $rowIndicators;
        }
        //file_put_contents('request.txt', '{"data":'.json_encode($rowsSkills).'}');
        $response->getBody()->write('{"data":'.json_encode($rowsSkills).'}');
    }
    //отримуємо конкретну компетенцію і її критерії
    else if($input["skill"] != "ALL_SKILLS" && $input['indicator'] == 'ALL_INDICATORS') {

        $rowsSkills = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type=1 && id=".$input["skill"]);
        $rowIndicators = DB::fetchAll("SELECT * FROM indicators WHERE skill_id=".$input["skill"]);
        $rowsSkills[0]['indicators'] = $rowIndicators;

        $response->getBody()->write('{"data":'.json_encode($rowsSkills).'}');
    }
    //отримуємо конкретний критерій
    else if($input["skill"] != "ALL_SKILLS" && $input['indicator'] != 'ALL_INDICATORS') {

        $rowsSkills = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type=1 && id=".$input["skill"]);
        $rowIndicators = DB::fetchAll("SELECT * FROM indicators WHERE id="
            .$input['indicator']." AND skill_id=".$input["skill"]);
        $rowsSkills[0]['indicators'] = $rowIndicators;

        $response->getBody()->write('{"data":'.json_encode($rowsSkills).'}');
    }
    return $response;
});

$app->post('/params', function (Request $request, Response $response, $args) {
    $input = $request->getParsedBody();

    //працюємо з компетенціями
    if($input['obj'] == 'SKILL') {

        $skillId = $input['skillId'];
        $skillName = $input['skillName'];
        //$skillGroup !!!!!!!!!!!!!!
        $skillDescription = $input['skillDescription'];

        //редагування компетенції
        if ($skillId != -1) {
            $sql = "UPDATE skill_tree SET skill_name='".$skillName.
                "', description='".$skillDescription."' WHERE  id=".$skillId.";";
            DB::exec($sql);
        }
        //створення компетенції
        else {
            /*
            $sql = "UPDATE skill_tree SET skill_name='".$skillName.
                "', description='".$skillDescription."' WHERE  id=".$skillId.";";
            DB::exec($sql);
            */
        }
    }
    //працюємо з критеріями
    else if($input['obj'] == 'INDICATOR'){
        $skillId = $input['skillId'];
        $indicatorId = $input['indicatorId'];
        $indicatorName = $input['indicatorName'];
        $indicatorDescription = $input['indicatorDescription'];

        //редагування індикатору
        if ($indicatorId != -1) {
            $sql = "UPDATE indicators SET indicator_name='".$indicatorName.
                "', description='".$indicatorDescription.
                "', skill_id=".$skillId." WHERE  id=".$indicatorId.";";
            DB::exec($sql);
        }
        //створення індикатору
        else {
            $sql = "INSERT INTO indicators (skill_id, indicator_name, description) 
              VALUES (".$skillId.", '".$indicatorName."', '".$indicatorDescription."');";
            DB::exec($sql);
        }
    }
    return $this->response->withJson($input);
});

/*
$app->put('/params/[{id}]', function (Request $request, Response $response, $args) {
    $input = $request->getParsedBody();
    file_put_contents('put.txt', $input);

    //$cityID = $input['city']['id'];
    //$cityName = $input['inputCityName'];
    //$sql = "UPDATE `params` SET `name`='" . $input['name'] . "' WHERE  `id`=" . $args['id'] . ";";
    //$params = DB::exec($sql);
    //$input['id'] = $args['id'];
    return $this->response->withJson($input);
});
*/

$app->delete('/params', function (Request $request, Response $response, $args) {
    /*
     *
     *
     *
     */
    $input = $request->getParsedBody();
    file_put_contents('delete.txt', $input);
    return $this->response->true;
});

$app->run();