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

//file_put_contents(filename, body);
//Отримання груп
$app->get('/params/{id}', function (Request $request, Response $response, $args) {
    $input = json_decode($args['id'], true);
    $tree = $input['tree'];
    //отримуємо дерево
    if($tree){
        if($tree == 'GROUPS AND SKILLS'){
            $rows = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = s.user_id) <> 0, ".
                "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = s.user_id), 'невідомий') AS user ".
                "FROM skill_tree s ORDER BY s.left_key;");
            if(count($rows) == 0){
                $sql = "INSERT INTO skill_tree SET left_key = 1, right_key = 2, node_level = 1, name = 'Бібліотека компетенцій', node_type = 0, user_id = 0;";
                DB::exec($sql);
                $rows = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = s.user_id) <> 0, ".
                    "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = s.user_id), 'невідомий') AS user ".
                    "FROM skill_tree s ORDER BY s.left_key;");
            }
            for ($i = 0; $i < count($rows); $i++) {
                if($rows[$i]['node_type'] == 1){
                    $rows[$i]['count_of_indicators'] = count(DB::fetchAll("SELECT * FROM indicators WHERE skill_id=".$rows[$i]['id'].";"));
                }
                else{
                    $rows[$i]['count_of_child_groups'] = count(DB::fetchAll("SELECT * FROM skill_tree WHERE left_key > ".$rows[$i]['left_key'].
                        " AND right_key < ".$rows[$i]['right_key']." AND node_type=0;"));
                    $rows[$i]['count_of_child_skills'] = count(DB::fetchAll("SELECT * FROM skill_tree WHERE left_key > ".$rows[$i]['left_key'].
                        " AND right_key < ".$rows[$i]['right_key']." AND node_type=1;"));
                }
                $rows[$i]['path'] = getPath($rows[$i]['left_key'], $rows[$i]['right_key']);
            }
        }
        else{
            $rows = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = s.user_id) <> 0, ".
                "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = s.user_id), 'невідомий') AS user ".
                "FROM skill_tree s WHERE s.node_type = 0  ORDER BY s.left_key");
            if(count($rows) == 0){
                $sql = "INSERT INTO skill_tree SET left_key = 1, right_key = 2, node_level = 1, name = 'Бібліотека компетенцій', node_type = 0, user_id = 0;";
                DB::exec($sql);
                $rows = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = s.user_id) <> 0, ".
                    "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = s.user_id), 'невідомий') AS user ".
                    "FROM skill_tree s WHERE s.node_type = 0  ORDER BY s.left_key");
            }
        }
        $response->getBody()->write('{"data":'.json_encode($rows).'}');
    }
    else{
        $groupID = $input["groupID"];
        $rowGroup = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = s.user_id) <> 0, ".
            "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = s.user_id), 'невідомий') AS user ".
            "FROM skill_tree s WHERE node_type=0 AND id = $groupID;");
        $rowGroup[0]['path'] = getPath($rowGroup[0]['left_key'], $rowGroup[0]['right_key']);
        if($rowGroup[0]['node_level']!=1) {
            $parentGroup = DB::fetchAll("SELECT * FROM skill_tree" .
                " WHERE left_key<" . $rowGroup[0]['left_key'] . " AND right_key>" . $rowGroup[0]['right_key'] . " AND node_level=" . ($rowGroup[0]['node_level'] - 1) . ";");
            $rowGroup[0]['parent_node'] = $parentGroup[0];
        }
        $response->getBody()->write('{"data":'.json_encode($rowGroup).'}');
    }
    return $response;
});

//Створення та копіювання групи
$app->post('/params', function (Request $request, Response $response, $args) {
    $input = $request->getParsedBody();
    $parentGroupID = $input['parentGroupID'];
    $groupName = $input['groupName'];
    $groupDescription = $input['groupDescription'];
    $userID = $input['userID'];
    $groupID = $input['groupID'];
    $isCopy = $input['isCopy'];

    //дані про кореневу групу
    $parentGroupInfo = DB::fetchAll("SELECT * FROM skill_tree WHERE id = $parentGroupID;");
    $parentGroupRightKey = $parentGroupInfo[0]['right_key'];
    $parentGroupLevel = $parentGroupInfo[0]['node_level'];

    //копіювання групи
    if($isCopy){
        $groupInfo = DB::fetchAll("SELECT * FROM skill_tree WHERE id = $groupID;");
        $groupLeftKey = $groupInfo[0]['left_key'];
        $groupRightKey = $groupInfo[0]['right_key'];
        $groupLevel = $groupInfo[0]['node_level'];
        $diff = $groupRightKey - $groupLeftKey + 1;

        $groupData = DB::fetchAll("SELECT * FROM skill_tree WHERE left_key >= $groupLeftKey AND right_key <= $groupRightKey;");

        $sql = "UPDATE skill_tree SET left_key = left_key + $diff, right_key = right_key + $diff " .
            "WHERE left_key > $parentGroupRightKey;";
        file_put_contents('_SQL_1.txt', $sql);
        DB::exec($sql);

        //оновлюємо батьківську гілку
        $sql = "UPDATE skill_tree SET right_key = right_key + $diff " .
            "WHERE right_key >= $parentGroupRightKey AND left_key < $parentGroupRightKey;";
        file_put_contents('_SQL_2.txt', $sql);
        DB::exec($sql);

        for($i = 0; $i < count($groupData); $i++){
            //додаємо новий вузол
            $sql = "INSERT INTO skill_tree SET left_key = ".($parentGroupRightKey + ($groupData[$i]['left_key'] - $groupLeftKey))
                .", right_key = ".($parentGroupRightKey + ($groupData[$i]['right_key'] - $groupLeftKey))
                .", node_level = ".($parentGroupLevel + 1 + ($groupData[$i]['node_level'] - $groupLevel))
                .", name='".$groupData[$i]['name']."', description='".$groupData[$i]['description']
                ."', node_type = ".$groupData[$i]['node_type'].", user_id = $userID;";
            DB::exec($sql);

            if($groupData[$i]['node_type'] == 1) {
                $newSkill = DB::fetchAll("SELECT * FROM skill_tree WHERE left_key = " . ($parentGroupRightKey + ($groupData[$i]['left_key'] - $groupLeftKey))
                    . " AND right_key = " . ($parentGroupRightKey + ($groupData[$i]['right_key'] - $groupLeftKey)) . ";");

                $newSkillID = $newSkill[0]['id'];
                $indicators = DB::fetchAll("SELECT * FROM indicators WHERE skill_id = ".$groupData[$i]['id'].";");

                for ($j = 0; $j < count($indicators); $j++) {
                    $sql = "INSERT INTO indicators (skill_id, name, description, user_id) " .
                        "VALUES ($newSkillID, '" . $indicators[$j]['name'] . "', '" . $indicators[$j]['description'] . "', $userID);";
                    DB::exec($sql);
                }
            }
        }
    }
    //створення групи
    else {
        //оновлюємо вузли, що знаходяться правіше
        $sql = "UPDATE skill_tree SET left_key = left_key + 2, right_key = right_key + 2 " .
            "WHERE left_key > $parentGroupRightKey;";
        DB::exec($sql);

        //оновлюємо батьківську гілку
        $sql = "UPDATE skill_tree SET right_key=right_key+2 " .
            "WHERE right_key >= $parentGroupRightKey AND left_key < $parentGroupRightKey;";
        DB::exec($sql);

        //додаємо новий вузол
        $sql = "INSERT INTO skill_tree SET left_key = $parentGroupRightKey, right_key = " .
            ($parentGroupRightKey + 1) . ", node_level = " . ($parentGroupLevel + 1) .
            ", name='$groupName', description='$groupDescription', node_type = 0, user_id = $userID;";
        DB::exec($sql);
    }
    return $this->response->withJson($input);
});

//Редагування групи
$app->put('/params/{id}', function (Request $request, Response $response, $args) {
    $input = json_decode($args['id'], true);
    $groupID = $input['groupID'];
    $parentGroupID = $input['parentGroupID'];
    $groupName = $input['groupName'];
    $groupDescription = $input['groupDescription'];
    $isMove = $input['isMove'];

    //переміщення групи
    if($isMove) {
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

        //оновлюємо нову батьківську гілку
        $sql = "UPDATE skill_tree SET right_key=right_key + $diff ".
            "WHERE right_key >= $parentGroupRightKey AND left_key < $parentGroupRightKey;";
        DB::exec($sql);

        $sql = "UPDATE skill_tree SET name = '$groupName', description='$groupDescription' WHERE id = $groupID;";
        DB::exec($sql);

        //оновлюємо новий вузол
        //коли переміщаємо лівіше
        if($parentGroupRightKey < $oldGroupLeftKey){
            $sql = "UPDATE skill_tree SET left_key=left_key-" . ($oldGroupLeftKey + $diff). "+" . $parentGroupRightKey .
                ", right_key=right_key-" . ($oldGroupLeftKey + $diff) . "+" . $parentGroupRightKey .
                ", node_level=node_level-" . $oldGroupLevel . "+" . ($parentGroupLevel + 1) . " " .
                "WHERE left_key>=" . ($oldGroupLeftKey + $diff) . " AND right_key<=" . ($oldGroupRightKey + $diff) . ";";
            DB::exec($sql);

            //оновлюємо ключі від попереднього вузла
            $sql = "UPDATE skill_tree SET right_key = right_key - $diff WHERE right_key > ($oldGroupRightKey + $diff);";
            DB::exec($sql);

            $sql = "UPDATE skill_tree SET left_key = left_key - $diff WHERE left_key > ($oldGroupRightKey + $diff);";
            DB::exec($sql);
        }
        //коли переміщаємо правіше
        else {
            $sql = "UPDATE skill_tree SET left_key=left_key-" . $oldGroupLeftKey . "+" . $parentGroupRightKey .
                ", right_key=right_key-" . $oldGroupLeftKey . "+" . $parentGroupRightKey .
                ", node_level=node_level-" . $oldGroupLevel . "+" . ($parentGroupLevel + 1) . " " .
                "WHERE left_key>=" . $oldGroupLeftKey . " AND right_key<=" . $oldGroupRightKey . ";";
            DB::exec($sql);

            //оновлюємо ключі від попереднього вузла
            $sql = "UPDATE skill_tree SET right_key = right_key - $diff WHERE right_key > $oldGroupRightKey;";
            DB::exec($sql);

            $sql = "UPDATE skill_tree SET left_key = left_key - $diff WHERE left_key > $oldGroupRightKey;";
            DB::exec($sql);
        }
    }
    //оновлення групи без переміщення
    else {
        $sql = "UPDATE skill_tree SET name = '$groupName', description = '$groupDescription' WHERE  id = $groupID;";
        DB::exec($sql);
    }
    return $this->response->withJson($input);

});

//Видалення групи
$app->delete('/params/[{id}]', function (Request $request, Response $response, $args) {
    $input = $request->getAttribute('id');
    $id = $input;

    //отримуємо дані про групу
    $item = DB::fetchAll("SELECT * FROM skill_tree WHERE id = $id;");
    $left_key = $item[0]['left_key'];
    $right_key = $item[0]['right_key'];

    //отримуємо список підлеглих компетенцій
    $skills = DB::fetchAll("SELECT * FROM skill_tree WHERE left_key >= $left_key AND right_key <= $right_key AND node_type = 1;");

    //видаляємо індикатори для підлеглих компетенцій
    for ($i = 0; $i < count($skills); $i++) {
        //видалення дій над даними індикаторами, що входять до даної компетенції
        $indicators = DB::fetchAll("SELECT * FROM indicators WHERE skill_id = ".$skills[$i]['id'].";");
        for($j = 0; $j < count($indicators); $j++){
            $sql = "DELETE FROM actions WHERE item_id = ".$indicators[$j]['id'].";";
            DB::exec($sql);
        }
        //видаляємо індикатори компетенції
        $sql = "DELETE FROM indicators WHERE skill_id = ".$skills[$i]['id'].";";
        DB::exec($sql);
    }

    //якщо обрана коренева група, то видаляємо її вміст, але не її
    if($item[0]['node_level'] == 1){
        //видаляємо усі дії
        $sql = "DELETE FROM actions;";
        DB::exec($sql);
        //видаляємо групи та компетенції
        $sql = "DELETE FROM skill_tree WHERE left_key > $left_key AND right_key < $right_key;";
        DB::exec($sql);
        $sql = "UPDATE skill_tree SET left_key = 1, right_key = 2 WHERE id = $id;";
        DB::exec($sql);
    }
    else {
        //видаляємо дії над підлеглими компетнціями та групами
        $skillsAndGroups = DB::fetchAll("SELECT * FROM skill_tree WHERE left_key >= $left_key AND right_key <= $right_key;");
        for($i = 0; $i < count($skillsAndGroups); $i++){
            $sql = "DELETE FROM actions WHERE item_id = ".$skillsAndGroups[$i]['id']." OR new_parent_id = ".$skillsAndGroups[$i]['id'].";";
            DB::exec($sql);
        }
        //видаляємо групи та компетенції
        $sql = "DELETE FROM skill_tree WHERE left_key >= $left_key AND right_key <= $right_key;";
        DB::exec($sql);
        $sql = "UPDATE skill_tree SET left_key = IF(left_key > " . $left_key . ", left_key - (" . $right_key . " - " .
            $left_key . " + 1), left_key), right_key = right_key - (" . $right_key . " - " .
            $left_key . " + 1) WHERE right_key > " . $right_key . ";";
        DB::exec($sql);
    }
    return $this->response->true;
});

$app->run();