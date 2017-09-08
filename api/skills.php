<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require 'vendor/autoload.php';
require 'db.php';

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

function getPath($leftKey, $rightKey){
    $parentGroups = DB::fetchAll("SELECT * FROM skill_tree".
        " WHERE left_key<" . $leftKey ." AND right_key>". $rightKey .
        " ORDER BY left_key;");
    $path = "";
    for($j = 0; $j < count($parentGroups); $j++){
        $path .= "/".$parentGroups[$j]['name'];
    }
    return $path;
}

//file_put_contents('NULL_ADD.txt', "NULL");
//Отримання даних про компетенції
$app->get('/params/{id}', function (Request $request, Response $response, $args) {
    $input = json_decode($args['id'], true);
    if($input == null){
        return $response;
    }
    $skillID = $input["skillID"];

    //отримуємо всі компетенції і їх критерії
    if ($skillID == "ALL_SKILLS") {
        $rowsSkills = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = s.user_id) <> 0, ".
            "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = s.user_id), 'невідомий') AS user ".
            "FROM skill_tree s WHERE s.node_type = 1;");
        for ($i = 0; $i < count($rowsSkills); $i++) {
            $rowsSkills[$i]['indicators'] = DB::fetchAll("SELECT * FROM indicators WHERE skill_id = ".$rowsSkills[$i]['id'].";");
            $rowsSkills[$i]['path'] = getPath($rowsSkills[$i]['left_key'], $rowsSkills[$i]['right_key']);
        }
        $data['rows'] = $rowsSkills;
        $response->getBody()->write('{"data":' . json_encode($data) . '}');
    }
    //отримуємо компетенції та їх критерії по групі
    else if($skillID == "BY_GROUP"){
        $groupID = $input['groupID'];
        $groupInfo = DB::fetchAll("SELECT * FROM skill_tree WHERE id = $groupID;");
        $groupLeftKey = $groupInfo[0]['left_key'];
        $groupRightKey = $groupInfo[0]['right_key'];

        $rowsSkills = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = s.user_id) <> 0, ".
            "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = s.user_id), 'невідомий') AS user ".
            "FROM skill_tree s WHERE s.left_key >= $groupLeftKey AND s.right_key <= $groupRightKey AND s.node_type = 1;");

        for ($i = 0; $i < count($rowsSkills); $i++) {
            $rowsSkills[$i]['indicators'] = DB::fetchAll("SELECT * FROM indicators WHERE skill_id = ".$rowsSkills[$i]['id'].";");
            $rowsSkills[$i]['path'] = getPath($rowsSkills[$i]['left_key'], $rowsSkills[$i]['right_key']);
        }
        $data['rows'] = $rowsSkills;
        $response->getBody()->write('{"data":' . json_encode($data) . '}');
    }
    //отримуємо конкретну компетенцію і її критерії
    else {
        $rowSkill = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = s.user_id) <> 0, ".
            "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = s.user_id), 'невідомий') AS user ".
            "FROM skill_tree s WHERE id = $skillID AND s.node_type = 1;");
        $rowSkill[0]['indicators'] = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id=i.user_id)<>0, ".
			"(SELECT CONCAT(u.first_name, ' ', u.second_name) FROM users u WHERE u.id=i.user_id), \"невідомий\") AS user ".
			"FROM indicators i WHERE i.skill_id = ".$rowSkill[0]['id'].";");
        $rowSkill[0]['path'] = getPath($rowSkill[0]['left_key'], $rowSkill[0]['right_key']);
        $parentGroup = DB::fetchAll("SELECT * FROM skill_tree".
            " WHERE left_key<" . $rowSkill[0]['left_key'] ." AND right_key>". $rowSkill[0]['right_key'] . " AND node_level=".($rowSkill[0]['node_level'] - 1).";");
        $rowSkill[0]['parent_node'] = $parentGroup[0];
        $response->getBody()->write('{"data":' . json_encode($rowSkill) . '}');
    }
    return $response;
});

//Створення та копіювання компетенції
$app->post('/params', function (Request $request, Response $response, $args) {
    $input = $request->getParsedBody();
    $skillName = $input['skillName'];
    $groupID = $input['groupID'];
    $skillDescription = $input['skillDescription'];
    $userID = $input['userID'];
    $skillID = $input['skillID'];
    $isCopy = $input['isCopy'];

    $groupInfo = DB::fetchAll("SELECT * FROM skill_tree WHERE id = $groupID;");
    $groupRightKey = $groupInfo[0]['right_key'];
    $groupLevel = $groupInfo[0]['node_level'];

    //оновлюємо вузли, що знаходяться правіше
    $sql = "UPDATE skill_tree SET left_key = left_key + 2, right_key = right_key + 2 ".
      "WHERE left_key > $groupRightKey;";
    DB::exec($sql);
    //оновлюємо батьківську гілку
    $sql = "UPDATE skill_tree SET right_key = right_key + 2 ".
      "WHERE right_key >= $groupRightKey AND left_key < $groupRightKey;";
    DB::exec($sql);

    //копіюємо вузол
    if($isCopy){
        $sql = "INSERT INTO skill_tree SET left_key = $groupRightKey, right_key = " . ($groupRightKey + 1) .
            ", node_level=" . ($groupLevel + 1) . ", name='" . $skillName . "', description='" .
            $skillDescription . "', node_type=1, user_id=" . $userID . ";";
        DB::exec($sql);

        $newSkill = DB::fetchAll("SELECT * FROM skill_tree WHERE left_key = $groupRightKey AND right_key = ".($groupRightKey + 1).";");
        $newSkillID = $newSkill[0]['id'];
        $indicators = DB::fetchAll("SELECT * FROM indicators WHERE skill_id = $skillID;");
        for($i = 0; $i < count($indicators); $i++){
            $sql = "INSERT INTO indicators (skill_id, name, description, user_id) ".
                "VALUES ($newSkillID, '".$indicators[$i]['name']."', '".$indicators[$i]['description']."', $userID);";
            DB::exec($sql);
        }
    }
    //додаємо новий вузол
    else {
        $sql = "INSERT INTO skill_tree SET left_key = $groupRightKey, right_key = " . ($groupRightKey + 1) .
            ", node_level = ($groupLevel + 1), name = '$skillName ', description = '" .
            $skillDescription . "', node_type = 1, user_id = $userID;";
        DB::exec($sql);
    }

    return $this->response->withJson($input);
});

//Редагування компетенції
$app->put('/params/{id}', function (Request $request, Response $response, $args) {
    $input = json_decode($args['id'], true);
    $skillID = $input['skillID'];
    $skillName = $input['skillName'];
    $groupID = $input['groupID'];
    $skillDescription = $input['skillDescription'];
    $isMove = $input['isMove'];

    //переміщення компетенції
    if($isMove) {
        $groupInfo = DB::fetchAll("SELECT * FROM skill_tree WHERE id = $groupID;");
        $groupRightKey = $groupInfo[0]['right_key'];
        $groupLevel = $groupInfo[0]['node_level'];

        $skill = DB::fetchAll("SELECT * FROM skill_tree WHERE id = $skillID;");
        $oldSkillRightKey = $skill[0]['right_key'];

        //оновлюємо вузли, що знаходяться правіше нової батьківської групи
        $sql = "UPDATE skill_tree SET left_key=left_key+2, right_key=right_key+2 ".
            "WHERE left_key > $groupRightKey;";
        DB::exec($sql);

        //оновлюємо нову батьківську гілку
        $sql = "UPDATE skill_tree SET right_key=right_key+2 ".
            "WHERE right_key >= $groupRightKey AND left_key < $groupRightKey;";
        DB::exec($sql);

        //оновлюємо новий вузол
        $sql = "UPDATE skill_tree SET left_key = $groupRightKey, right_key = ".($groupRightKey + 1).
            ", node_level = ".($groupLevel + 1).", name = '$skillName', description = '$skillDescription' WHERE id = $skillID;";
        DB::exec($sql);

        //оновлюємо ключі від попереднього вузла
        $sql = "UPDATE skill_tree SET right_key=right_key-2 WHERE right_key > $oldSkillRightKey;";
        DB::exec($sql);
        $sql = "UPDATE skill_tree SET left_key=left_key-2 WHERE left_key > $oldSkillRightKey;";
        DB::exec($sql);
    }
    //оновлення без переміщення
    else{
        $sql = "UPDATE skill_tree SET name = '$skillName', description = '$skillDescription' WHERE  id = $skillID;";
        DB::exec($sql);
    }
    return $this->response->withJson($input);
});

//Видалення компетенції
$app->delete('/params/[{id}]', function (Request $request, Response $response, $args) {
    $input = $request->getAttribute('id');
    $id = $input;

    //видалення дій над даними індикаторами, що входять до даної компетенції
    $indicators = DB::fetchAll("SELECT * FROM indicators WHERE skill_id = $id;");
    for($i = 0; $i < count($indicators); $i++){
        $sql = "DELETE FROM actions WHERE item_id = ".$indicators[$i]['id'].";";
        DB::exec($sql);
    }
    //видаляємо індикатори компетенції
    $sql = "DELETE FROM indicators WHERE skill_id = $id;";
    DB::exec($sql);

    //видалення дій над даною компетенцією
    $sql = "DELETE FROM actions WHERE item_id = $id OR new_parent_id = $id;";
    DB::exec($sql);
    //видаляємо компетенцію та оновлюємо вузли
    $item = DB::fetchAll("SELECT * FROM skill_tree WHERE id = $id;");
    $left_key = $item[0]['left_key'];
    $right_key = $item[0]['right_key'];
    $sql = "DELETE FROM skill_tree WHERE id = $id";
    DB::exec($sql);
    $sql = "UPDATE skill_tree SET left_key = IF(left_key > ".$left_key.", left_key - (".$right_key." - ".
        $left_key." + 1), left_key), right_key = right_key - (".$right_key." - ".
        $left_key." + 1) WHERE right_key > ".$right_key.";";
    DB::exec($sql);
    return $this->response->true;
});

$app->run();
