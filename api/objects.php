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

//date_default_timezone_set('UTC+2');
function getPath($leftKey, $rightKey){
    $parentGroups = DB::fetchAll("SELECT * FROM object_tree".
        " WHERE left_key<" . $leftKey ." AND right_key>". $rightKey .
        " ORDER BY left_key;");
    $path = "";
    for($j = 0; $j < count($parentGroups); $j++){
        $path .= "/".$parentGroups[$j]['name'];
    }
    return $path;
}

//file_put_contents('NULL_ADD.txt', "NULL");
//Отримання даних про об'єкти
$app->get('/params/{id}', function (Request $request, Response $response, $args) {
    $input = json_decode($args['id'], true);
    if($input == null){
        return $response;
    }
    $objectID = $input["objectID"];

    //отримуємо всі об'єкти та їх критерії
    if ($objectID == "ALL_OBJECTS") {
        $rowsObjects = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = s.user_id) <> 0, ".
            "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = s.user_id), 'невідомий') AS user ".
            "FROM object_tree s WHERE s.node_type = 1;");
        for ($i = 0; $i < count($rowsObjects); $i++) {
            $rowsObjects[$i]['indicators'] = DB::fetchAll("SELECT * FROM indicators WHERE object_id = ".$rowsObjects[$i]['id'].";");
            $rowsObjects[$i]['path'] = getPath($rowsObjects[$i]['left_key'], $rowsObjects[$i]['right_key']);
        }
        $data['rows'] = $rowsObjects;
        $response->getBody()->write('{"data":' . json_encode($data) . '}');
    }
    //отримуємо об'єкти та їх критерії по групі
    else if($objectID == "BY_GROUP"){
        $groupID = $input['groupID'];
        $groupInfo = DB::fetchAll("SELECT * FROM object_tree WHERE id = $groupID;");
        $groupLeftKey = $groupInfo[0]['left_key'];
        $groupRightKey = $groupInfo[0]['right_key'];

        $rowsObjects = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = s.user_id) <> 0, ".
            "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = s.user_id), 'невідомий') AS user ".
            "FROM object_tree s WHERE s.left_key >= $groupLeftKey AND s.right_key <= $groupRightKey AND s.node_type = 1;");

        for ($i = 0; $i < count($rowsObjects); $i++) {
            $rowsObjects[$i]['indicators'] = DB::fetchAll("SELECT * FROM indicators WHERE object_id = ".$rowsObjects[$i]['id'].";");
            $rowsObjects[$i]['path'] = getPath($rowsObjects[$i]['left_key'], $rowsObjects[$i]['right_key']);
        }
        $data['rows'] = $rowsObjects;
        $response->getBody()->write('{"data":' . json_encode($data) . '}');
    }
    //отримуємо конкретний об'єкт і його критерії
    else {
        $rowObject = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = s.user_id) <> 0, ".
            "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = s.user_id), 'невідомий') AS user ".
            "FROM object_tree s WHERE id = $objectID AND s.node_type = 1;");
        $rowObject[0]['indicators'] = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id=i.user_id)<>0, ".
			"(SELECT CONCAT(u.first_name, ' ', u.second_name) FROM users u WHERE u.id=i.user_id), \"невідомий\") AS user ".
			"FROM indicators i WHERE i.object_id = ".$rowObject[0]['id'].";");
        $rowObject[0]['path'] = getPath($rowObject[0]['left_key'], $rowObject[0]['right_key']);
        $parentGroup = DB::fetchAll("SELECT * FROM object_tree".
            " WHERE left_key<" . $rowObject[0]['left_key'] ." AND right_key>". $rowObject[0]['right_key'] . " AND node_level=".($rowObject[0]['node_level'] - 1).";");
        $rowObject[0]['parent_node'] = $parentGroup[0];
        $response->getBody()->write('{"data":' . json_encode($rowObject) . '}');
    }
    return $response;
});

//Створення та копіювання об'єкта
$app->post('/params', function (Request $request, Response $response) {
    //file_put_contents('OBJECT.txt', "Create");

    date_default_timezone_set('Europe/Kiev');
    $now = date("d.m.y G:i");

    $input = $request->getParsedBody();
    $objectName = $input['objectName'];
    $groupID = $input['groupID'];
    $objectDescription = $input['objectDescription'];
    $userID = $input['userID'];
    $objectID = $input['objectID'];
    $isCopy = $input['isCopy'];

    $groupInfo = DB::fetchAll("SELECT * FROM object_tree WHERE id = $groupID;");
    $groupRightKey = $groupInfo[0]['right_key'];
    $groupLevel = $groupInfo[0]['node_level'];

    //оновлюємо вузли, що знаходяться правіше
    $sql = "UPDATE object_tree SET left_key = left_key + 2, right_key = right_key + 2 ".
      "WHERE left_key > $groupRightKey;";
    DB::exec($sql);
    //оновлюємо батьківську гілку
    $sql = "UPDATE object_tree SET right_key = right_key + 2 ".
      "WHERE right_key >= $groupRightKey AND left_key < $groupRightKey;";
    DB::exec($sql);

    //копіюємо вузол
    if($isCopy){
        $sql = "INSERT INTO object_tree SET left_key = $groupRightKey, right_key = " . ($groupRightKey + 1) .
            ", node_level=" . ($groupLevel + 1) . ", name='" . $objectName . "', description='" .
            $objectDescription . "', node_type=1, user_id=" . $userID . ", creation_date = '$now';";
        DB::exec($sql);

        $newObject = DB::fetchAll("SELECT * FROM object_tree WHERE left_key = $groupRightKey AND right_key = ".($groupRightKey + 1).";");
        $newObjectID = $newObject[0]['id'];
        $indicators = DB::fetchAll("SELECT * FROM indicators WHERE object_id = $objectID;");
        for($i = 0; $i < count($indicators); $i++){
            $sql = "INSERT INTO indicators (object_id, name, description, user_id, creation_date) ".
                "VALUES ($newObjectID, '".$indicators[$i]['name']."', '".$indicators[$i]['description']."', $userID, '$now');";
            DB::exec($sql);
        }
    }
    //додаємо новий вузол
    else {
        $sql = "INSERT INTO object_tree SET left_key = $groupRightKey, right_key = " . ($groupRightKey + 1) .
            ", node_level = ($groupLevel + 1), name = '$objectName ', description = '" .
            $objectDescription . "', node_type = 1, user_id = $userID, creation_date='$now';";
        DB::exec($sql);
    }

    return $this->$response->withJson($input);
});

//Редагування об'єкта
$app->put('/params/{id}', function (Request $request, Response $response, $args) {
    $input = json_decode($args['id'], true);
    $objectID = $input['objectID'];
    $objectName = $input['objectName'];
    $groupID = $input['groupID'];
    $objectDescription = $input['objectDescription'];
    $isMove = $input['isMove'];

    //переміщення об'єкта
    if($isMove) {
        $groupInfo = DB::fetchAll("SELECT * FROM object_tree WHERE id = $groupID;");
        $groupRightKey = $groupInfo[0]['right_key'];
        $groupLevel = $groupInfo[0]['node_level'];

        $object = DB::fetchAll("SELECT * FROM object_tree WHERE id = $objectID;");
        $oldObjectRightKey = $object[0]['right_key'];

        //оновлюємо вузли, що знаходяться правіше нової батьківської групи
        $sql = "UPDATE object_tree SET left_key=left_key+2, right_key=right_key+2 ".
            "WHERE left_key > $groupRightKey;";
        DB::exec($sql);

        //оновлюємо нову батьківську гілку
        $sql = "UPDATE object_tree SET right_key=right_key+2 ".
            "WHERE right_key >= $groupRightKey AND left_key < $groupRightKey;";
        DB::exec($sql);

        //оновлюємо новий вузол
        $sql = "UPDATE object_tree SET left_key = $groupRightKey, right_key = ".($groupRightKey + 1).
            ", node_level = ".($groupLevel + 1)." WHERE id = $objectID;";
        DB::exec($sql);

        //оновлюємо ключі від попереднього вузла
        $sql = "UPDATE object_tree SET right_key=right_key-2 WHERE right_key > $oldObjectRightKey;";
        DB::exec($sql);
        $sql = "UPDATE object_tree SET left_key=left_key-2 WHERE left_key > $oldObjectRightKey;";
        DB::exec($sql);
    }
    //оновлення без переміщення
    else{
        $sql = "UPDATE object_tree SET name = '$objectName', description = '$objectDescription' WHERE  id = $objectID;";
        DB::exec($sql);
    }
    return $this->response->withJson($input);
});

//Видалення об'кта
$app->delete('/params/[{id}]', function (Request $request, Response $response, $args) {
    $input = $request->getAttribute('id');
    $id = $input;

    //видалення дій над даними індикаторами, що входять до даного об'єкта
    $indicators = DB::fetchAll("SELECT * FROM indicators WHERE object_id = $id;");
    for($i = 0; $i < count($indicators); $i++){
        $sql = "DELETE FROM actions WHERE item_id = ".$indicators[$i]['id'].";";
        DB::exec($sql);
    }
    //видаляємо індикатори об'єкта
    $sql = "DELETE FROM indicators WHERE object_id = $id;";
    DB::exec($sql);

    //видалення дій над даним об'єктом
    $sql = "DELETE FROM actions WHERE item_id = $id OR new_parent_id = $id;";
    DB::exec($sql);
    //видаляємо об'єкт та оновлюємо вузли
    $item = DB::fetchAll("SELECT * FROM object_tree WHERE id = $id;");
    $left_key = $item[0]['left_key'];
    $right_key = $item[0]['right_key'];
    $sql = "DELETE FROM object_tree WHERE id = $id";
    DB::exec($sql);
    $sql = "UPDATE object_tree SET left_key = IF(left_key > ".$left_key.", left_key - (".$right_key." - ".
        $left_key." + 1), left_key), right_key = right_key - (".$right_key." - ".
        $left_key." + 1) WHERE right_key > ".$right_key.";";
    DB::exec($sql);
    return $this->response->true;
});

$app->run();
