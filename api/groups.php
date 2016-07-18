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

    //отримуємо дерево
    if($input['tree']){
        $rows = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type = 0  ORDER BY left_key");
        $response->getBody()->write('{"data":'.json_encode($rows).'}');
    }
    else{
        $rowGroup = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type=0 AND id = " . $input["groupId"]);

        $parentGroups = DB::fetchAll("SELECT * FROM skill_tree WHERE left_key < " . $rowGroup[0]['left_key']." AND right_key > ".$rowGroup[0]['right_key'].
            " ORDER BY left_key;");
        $path = "";
        for($j = 0; $j < count($parentGroups); $j++){
            $path .= "/".$parentGroups[$j]['skill_name'];
        }
        $rowGroup[0]['path'] = $path;

        $user = DB::fetchAll("SELECT * FROM users WHERE id = " . $rowGroup[0]['user_id'].";");
        $userName = $user[0]['firstname']." ".$user[0]['secondname'];
        $rowGroup[0]['user'] = $userName;

        $response->getBody()->write('{"data":'.json_encode($rowGroup).'}');
    }
    return $response;
});

//створення групи
$app->post('/params', function (Request $request, Response $response, $args) {
    $input = $request->getParsedBody();

    file_put_contents('SQL_0.txt', 'start');
    $parentGroupID = $input['parentGroupID'];
    $groupName = $input['groupName'];
    $groupDescription = $input['groupDescription'];
    $userID = $input['userID'];

    $groupInfo = DB::fetchAll("SELECT * FROM skill_tree WHERE id = $parentGroupID;");
    $groupRightKey = $groupInfo[0]['right_key'];
    $groupLevel = $groupInfo[0]['node_level'];

    //оновлюємо вузли, що знаходяться правіше
    $sql = "UPDATE skill_tree SET left_key = left_key + 2, right_key = right_key + 2 ".
        "WHERE left_key > $groupRightKey;";
    file_put_contents('SQL_1.txt', $sql);
    DB::exec($sql);

    //оновлюємо батьківську гілку
    $sql = "UPDATE skill_tree SET right_key=right_key+2 ".
        "WHERE right_key >= $groupRightKey AND left_key < $groupRightKey;";
    file_put_contents('SQL_2.txt', $sql);
    DB::exec($sql);

    //додаємо новий вузол
    $sql = "INSERT INTO skill_tree SET left_key = $groupRightKey, right_key = ".
        ($groupRightKey + 1).", node_level = ".($groupLevel + 1).
        ", skill_name='$groupName', description='$groupDescription', node_type = 0, user_id = $userID;";
    file_put_contents('SQL_3.txt', $sql);
    DB::exec($sql);

    return $this->response->withJson($input);
});

//редагування групи
$app->put('/params/{id}', function ($request, $response, $args) {
    $input = json_decode($args['id'], true);

    $groupID = $input['groupID'];
    $parentGroupID = $input['parentGroupID'];
    $groupName = $input['groupName'];
    $groupDescription = $input['groupDescription'];
    $isMove = $input['isMove'];

    if($isMove) {
        //переміщення групи
        $parentGroupInfo = DB::fetchAll("SELECT * FROM skill_tree WHERE id = $parentGroupID;");
        $parentGroupRightKey = $parentGroupInfo[0]['right_key'];
        $parentGroupLevel = $parentGroupInfo[0]['node_level'];

        $group = DB::fetchAll("SELECT * FROM skill_tree WHERE id = $groupID;");
        $oldGroupLeftKey = $group[0]['left_key'];
        $oldGroupRightKey = $group[0]['right_key'];
        $oldGroupLevel = $group[0]['node_level'];
        $diff = $oldGroupRightKey - $oldGroupLeftKey + 1;

        //оновлюємо вузли, що знаходяться правіше нової батьківської групи
        $sql = "UPDATE skill_tree SET left_key = left_key + $diff, right_key = right_key + $diff ".
            "WHERE left_key > $parentGroupRightKey;";
        DB::exec($sql);
        //file_put_contents('SQL_1.txt', $sql);

        //оновлюємо нову батьківську гілку
        $sql = "UPDATE skill_tree SET right_key=right_key + $diff ".
            "WHERE right_key >= $parentGroupRightKey AND left_key < $parentGroupRightKey;";
        DB::exec($sql);
        //file_put_contents('SQL_2.txt', $sql);

        $sql = "UPDATE skill_tree SET skill_name = '$groupName', description='$groupDescription' WHERE id = $groupID;";
        DB::exec($sql);
        //file_put_contents('SQL_3.txt', $sql);

        //оновлюємо новий вузол
        //коли переміщаємо лівіше
        if($parentGroupRightKey < $oldGroupLeftKey){
            $sql = "UPDATE skill_tree SET left_key=left_key-" . ($oldGroupLeftKey + $diff). "+" . $parentGroupRightKey .
                ", right_key=right_key-" . ($oldGroupLeftKey + $diff) . "+" . $parentGroupRightKey .
                ", node_level=node_level-" . $oldGroupLevel . "+" . ($parentGroupLevel + 1) . " " .
                "WHERE left_key>=" . ($oldGroupLeftKey + $diff) . " AND right_key<=" . ($oldGroupRightKey + $diff) . ";";
            DB::exec($sql);
            //file_put_contents('SQL_4.txt', $sql);

            //оновлюємо ключі від попереднього вузла
            $sql = "UPDATE skill_tree SET right_key = right_key - $diff WHERE right_key > ($oldGroupRightKey + $diff);";
            DB::exec($sql);
            //file_put_contents('SQL_5.txt', $sql);

            $sql = "UPDATE skill_tree SET left_key = left_key - $diff WHERE left_key > ($oldGroupRightKey + $diff);";
            DB::exec($sql);
            //file_put_contents('SQL_6.txt', $sql);
        }
        //коли переміщаємо правіше
        else {
            $sql = "UPDATE skill_tree SET left_key=left_key-" . $oldGroupLeftKey . "+" . $parentGroupRightKey .
                ", right_key=right_key-" . $oldGroupLeftKey . "+" . $parentGroupRightKey .
                ", node_level=node_level-" . $oldGroupLevel . "+" . ($parentGroupLevel + 1) . " " .
                "WHERE left_key>=" . $oldGroupLeftKey . " AND right_key<=" . $oldGroupRightKey . ";";
            DB::exec($sql);
            //file_put_contents('SQL_4.txt', $sql);

            //оновлюємо ключі від попереднього вузла
            $sql = "UPDATE skill_tree SET right_key = right_key - $diff WHERE right_key > $oldGroupRightKey;";
            DB::exec($sql);
            //file_put_contents('SQL_5.txt', $sql);

            $sql = "UPDATE skill_tree SET left_key = left_key - $diff WHERE left_key > $oldGroupRightKey;";
            DB::exec($sql);
            //file_put_contents('SQL_6.txt', $sql);
        }
    }
    else {
        $sql = "UPDATE skill_tree SET skill_name = '$groupName', description = '$groupDescription' WHERE  id = $groupID;";
        DB::exec($sql);
    }

    return $this->response->withJson($input);

});

$app->delete('/params/[{id}]', function (Request $request, Response $response, $args) {
    $input = $request->getAttribute('id');
    $id = $input;

    $item = DB::fetchAll("SELECT * FROM skill_tree WHERE id = $id;");
    $left_key = $item[0]['left_key'];
    $right_key = $item[0]['right_key'];

    //отримуємо список підлеглих компетенцій
    $skills = DB::fetchAll("SELECT * FROM skill_tree WHERE left_key >= $left_key AND right_key <= $right_key AND node_type = 1;");

    //видаляємо індикатори для підлеглих компетенцій
    for ($i = 0; $i < count($skills); $i++) {
        $sql = "DELETE FROM indicators WHERE skill_id = ".$skills[$i]['id'].";";
        DB::exec($sql);
    }

    if($item[0]['left_key'] == 1){
        $sql = "DELETE FROM skill_tree WHERE left_key > $left_key AND right_key < $right_key;";
        DB::exec($sql);

        $sql = "UPDATE skill_tree SET left_key = 1 right_key = 2 WHERE id = $id;";
        DB::exec($sql);
    }
    else {
        $sql = "DELETE FROM skill_tree WHERE left_key >= " . $left_key . " AND right_key <= " . $right_key . ";";
        DB::exec($sql);

        $sql = "UPDATE skill_tree SET left_key = IF(left_key > " . $left_key . ", left_key - (" . $right_key . " - " .
            $left_key . " + 1), left_key), right_key = right_key - (" . $right_key . " - " .
            $left_key . " + 1) WHERE right_key > " . $right_key . ";";
        DB::exec($sql);
    }

    return $this->response->true;
});

$app->run();
