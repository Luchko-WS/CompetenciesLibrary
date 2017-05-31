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

    if($input['tree']){
        $rows = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type=0  ORDER BY left_key");
        $response->getBody()->write('{"data":'.json_encode($rows).'}');
    }
    else{
        /*if($input['getParent']){
            $item = DB::fetchAll("SELECT * FROM skill_tree WHERE id=".$input['groupId'].";");
            $parentItem = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type=0 AND node_level=".$item[0]['node_level'].
            "-1 AND left_key<=".$item[0]['left_key']." AND right_key >= ".$item[0]['right_key'].";");
            $response->getBody()->write('{"data":'.json_encode($parentItem).'}');
        }
        else{*/
            $rowGroup = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type=0 AND id=" . $input["groupId"]);
            $response->getBody()->write('{"data":'.json_encode($rowGroup).'}');
        /*}*/
    }
    return $response;
});

$app->post('/params', function (Request $request, Response $response, $args) {
    $input = $request->getParsedBody();

    $groupId = $input['groupId'];
    $groupName = $input['groupName'];
    $groupRightKey = $input['groupRightKey'];
    $groupLevel = $input['groupLevel'];
    $groupDescription = $input['groupDescription'];

    //редагування групи
    if ($groupId != -1) {
        $sql = "UPDATE skill_tree SET skill_name='".$groupName.
            "', description='".$groupDescription."' WHERE  id=".$groupId.";";
        DB::exec($sql);
        //переміщення групи
    }
    //створення групи
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
        $sql = "INSERT INTO skill_tree SET left_key=".$groupRightKey.", right_key=".($groupRightKey + 1).", node_level=".
            ($groupLevel + 1).", skill_name='".$groupName."', description='".$groupDescription."', node_type=0;";
        DB::exec($sql);
        file_put_contents('SQL.txt', $sql);

    }

    return $this->response->withJson($input);
});

$app->delete('/params/[{id}]', function (Request $request, Response $response, $args) {
    $input = $request->getAttribute('id');
    $id = $input;

    $item = DB::fetchAll("SELECT * FROM skill_tree WHERE id=".$id.";");
    $left_key = $item[0]['left_key'];
    $right_key = $item[0]['right_key'];

    //отримуємо список підлеглих компетенцій
    $skills = DB::fetchAll("SELECT * FROM skill_tree WHERE left_key >= ".$left_key." AND right_key <= ".
        $right_key." AND node_type=1;");

    //видаляємо індикатори для підлеглих компетенцій
    for ($i = 0; $i < count($skills); $i++) {
        $sql = "DELETE FROM indicators WHERE skill_id = ".$skills[$i]['id'].";";
        DB::exec($sql);
    }

    $sql = "DELETE FROM skill_tree WHERE left_key >= ".$left_key." AND right_key <= ".$right_key.";";
    DB::exec($sql);

    $sql = "UPDATE skill_tree SET left_key = IF(left_key > ".$left_key.", left_key - (".$right_key." - ".
        $left_key." + 1), left_key), right_key = right_key - (".$right_key." - ".
        $left_key." + 1) WHERE right_key > ".$right_key.";";
    DB::exec($sql);

    return $this->response->true;
});

$app->run();
