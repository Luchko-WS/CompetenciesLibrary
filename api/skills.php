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

    if($input == null){
        file_put_contents('NULL_ADD.txt', "NULL");
        return $response;
    }

    //отримуємо всі компетенції і їх критерії
    if ($input["skillId"] == "ALL_SKILLS") {
        $rowsSkills = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type=1;");

        for ($i = 0; $i < count($rowsSkills); $i++) {
            $rowIndicators = DB::fetchAll("SELECT * FROM indicators WHERE skill_id=" . $rowsSkills[$i]['id']);
            $rowsSkills[$i]['indicators'] = $rowIndicators;
        }
        $data['rows'] = $rowsSkills;
        $response->getBody()->write('{"data":' . json_encode($data) . '}');
    }
    //отримуємо компетенцію по групі
    else if($input["skillId"] == "BY_GROUP"){

        $rowsSkills = DB::fetchAll("SELECT * FROM skill_tree WHERE left_key >= ".$input['left_key']." AND right_key <= ".
            $input['right_key']." AND node_type=1;");

        //file_put_contents('SKILLS BY GROUP', count($rowsSkills));

        for ($i = 0; $i < count($rowsSkills); $i++) {
            $rowIndicators = DB::fetchAll("SELECT * FROM indicators WHERE skill_id=" . $rowsSkills[$i]['id']);
            $rowsSkills[$i]['indicators'] = $rowIndicators;
        }
        $data['rows'] = $rowsSkills;
        $response->getBody()->write('{"data":' . json_encode($data) . '}');
    }
    //отримуємо конкретну компетенцію і її критерії
    else {

        $rowsSkills = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type=1 && id=" . $input["skillId"]);
        $rowIndicators = DB::fetchAll("SELECT * FROM indicators WHERE skill_id=" . $input["skillId"]);
        $rowsSkills[0]['indicators'] = $rowIndicators;

        $response->getBody()->write('{"data":' . json_encode($rowsSkills) . '}');
    }

    return $response;
});

$app->post('/params', function (Request $request, Response $response, $args) {
    $input = $request->getParsedBody();

    if($input == null){
        file_put_contents('NULL_ADD.txt', "NULL");
        return -1;
    }

    $skillId = $input['skillId'];
    $skillName = $input['skillName'];
    $groupRightKey = $input['groupRightKey'];
    $groupLevel = $input['groupLevel'];
    $skillDescription = $input['skillDescription'];
    $userId = $input['userId'];

    //редагування компетенції
    if ($skillId != -1) {
        $sql = "UPDATE skill_tree SET skill_name='".$skillName.
            "', description='".$skillDescription."' WHERE  id=".$skillId.";";
        DB::exec($sql);
        //переміщення компетенції
    }
    //створення компетенції
    else {
        //оновлюємо вузли, що знаходяться правіше
        $sql = "UPDATE skill_tree SET left_key=left_key+2, right_key=right_key+2 ".
          "WHERE left_key > ".$groupRightKey.";";
        DB::exec($sql);

        //оновлюємо батьківську гілку
        $sql = "UPDATE skill_tree SET right_key=right_key+2 ".
          "WHERE right_key>=".$groupRightKey." AND left_key<".$groupRightKey.";";
        DB::exec($sql);

        //додаємо новий вузол
        $sql = "INSERT INTO skill_tree SET left_key=".$groupRightKey.", right_key=".($groupRightKey + 1).
            ", node_level=".($groupLevel + 1).", skill_name='".$skillName."', description='".
            $skillDescription."', node_type=1, user_id=".$userId.";";
        DB::exec($sql);
        //file_put_contents('add_skill 3.txt', $sql);
    }

    return $this->response->withJson($input);
});

$app->delete('/params/[{id}]', function (Request $request, Response $response, $args) {
    $input = $request->getAttribute('id');
    $id = $input;

    $item = DB::fetchAll("SELECT * FROM skill_tree WHERE id=".$id.";");
    $left_key = $item[0]['left_key'];
    $right_key = $item[0]['right_key'];

    $sql = "DELETE FROM skill_tree WHERE left_key >= ".$left_key." AND right_key <= ".$right_key.";";
    DB::exec($sql);

    $sql = "DELETE FROM indicators WHERE skill_id = ".$id.";";
    DB::exec($sql);

    $sql = "UPDATE skill_tree SET left_key = IF(left_key > ".$left_key.", left_key - (".$right_key." - ".
        $left_key." + 1), left_key), right_key = right_key - (".$right_key." - ".
        $left_key." + 1) WHERE right_key > ".$right_key.";";
    DB::exec($sql);

    return $this->response->true;
});

$app->run();
