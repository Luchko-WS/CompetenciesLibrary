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

function getPath($leftKey, $rightKey){
    $parentGroups = DB::fetchAll("SELECT * FROM skill_tree".
        " WHERE left_key<" . $leftKey ." AND right_key>". $rightKey .
        " ORDER BY left_key;");
    $path = "";
    for($j = 0; $j < count($parentGroups); $j++){
        $path .= "/".$parentGroups[$j]['skill_name'];
    }
    return $path;
}

function getParentID($leftKey, $rightKey){
    $parentGroups = DB::fetchAll("SELECT * FROM skill_tree".
        " WHERE left_key<" . $leftKey ." AND right_key>". $rightKey .
        " ORDER BY left_key;");
    $parentID = $parentGroups[count($parentGroups)-1]['id'];
    return $parentID;
}

function getUserName($userID){
    $user = DB::fetchAll("SELECT * FROM users".
        " WHERE id=" . $userID.";");
    $userName = $user[0]['firstname']." ".$user[0]['secondname'];
    return $userName;
}

$app->get('/params/{id}', function (Request $request, Response $response, $args) {

    $input = json_decode($args['id'], true);

    //отримуємо дерево
    if($input['tree']){
        if($input['tree'] == 'GROUPS AND SKILLS'){
            $rows = DB::fetchAll("SELECT * FROM skill_tree ORDER BY left_key");

            if(count($rows) == 0){
                $sql = "INSERT INTO skill_tree SET left_key = 1, right_key = 2, node_level = 1, skill_name = 'Бібліотека компетенцій', node_type = 0, user_id = 0;";
                DB::exec($sql);
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
                if($rows[$i]['left_key']!=1) {
                    $rows[$i]['parent_id'] = getParentID($rows[$i]['left_key'], $rows[$i]['right_key']);
                }
                $rows[$i]['path'] = getPath($rows[$i]['left_key'], $rows[$i]['right_key']);
                $rows[$i]['user'] = getUserName($rows[$i]['user_id']);
            }
        }
        else{
            $rows = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type = 0  ORDER BY left_key");

            if(count($rows) == 0){
                $sql = "INSERT INTO skill_tree SET left_key = 1, right_key = 2, node_level = 1, skill_name = 'Бібліотека компетенцій', node_type = 0, user_id = 0;";
                DB::exec($sql);
            }
        }
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

    //file_put_contents('SQL_0.txt', 'start');
    $parentGroupID = $input['parentGroupID'];
    $groupName = $input['groupName'];
    $groupDescription = $input['groupDescription'];
    $userID = $input['userID'];
    $groupID = $input['groupID'];
    $isCopy = $input['isCopy'];

    $parentGroupInfo = DB::fetchAll("SELECT * FROM skill_tree WHERE id = $parentGroupID;");
    $parentGroupRightKey = $parentGroupInfo[0]['right_key'];
    $parentGroupLevel = $parentGroupInfo[0]['node_level'];

    if($isCopy){
        $groupInfo = DB::fetchAll("SELECT * FROM skill_tree WHERE id = $groupID;");
        $groupLeftKey = $groupInfo[0]['left_key'];
        $groupRightKey = $groupInfo[0]['right_key'];
        $groupLevel = $groupInfo[0]['node_level'];
        $diff = $groupRightKey - $groupLeftKey + 1;

        $sql = "UPDATE skill_tree SET left_key = left_key + $diff, right_key = right_key + $diff " .
            "WHERE left_key > $parentGroupRightKey;";
        //file_put_contents('_SQL_1.txt', $sql);
        DB::exec($sql);

        //оновлюємо батьківську гілку
        $sql = "UPDATE skill_tree SET right_key = right_key + $diff " .
            "WHERE right_key >= $parentGroupRightKey AND left_key < $parentGroupRightKey;";
        //file_put_contents('_SQL_2.txt', $sql);
        DB::exec($sql);

        $groupData = DB::fetchAll("SELECT * FROM skill_tree WHERE left_key >= $groupLeftKey AND right_key <= $groupRightKey;");
        //file_put_contents('_SQL_3.txt', "SELECT * FROM skill_tree WHERE left_key >= $groupLeftKey AND right_key <= $groupRightKey;");

        for($i = 0; $i < count($groupData); $i++){
            //додаємо новий вузол
            $sql = "INSERT INTO skill_tree SET left_key = ".($parentGroupRightKey + ($groupData[$i]['left_key'] - $groupLeftKey))
                .", right_key = ".($parentGroupRightKey + ($groupData[$i]['right_key'] - $groupLeftKey))
                .", node_level = ".($parentGroupLevel + 1 + ($groupData[$i]['node_level'] - $groupLevel))
                .", skill_name='".$groupData[$i]['skill_name']."', description='".$groupData[$i]['description']
                ."', node_type = ".$groupData[$i]['node_type'].", user_id = $userID;";
            DB::exec($sql);

            if($groupData[$i]['node_type'] == 1) {
                $newSkill = DB::fetchAll("SELECT * FROM skill_tree WHERE left_key = " . ($parentGroupRightKey + ($groupData[$i]['left_key'] - $groupLeftKey))
                    . " AND right_key = " . ($parentGroupRightKey + ($groupData[$i]['right_key'] - $groupLeftKey)) . ";");

                $newSkillID = $newSkill[0]['id'];
                $indicators = DB::fetchAll("SELECT * FROM indicators WHERE skill_id = ".$groupData[$i]['id'].";");
                //file_put_contents('_SQL_INDICATORS_'.$i.'.txt', "SELECT * FROM indicators WHERE skill_id = $groupData[$i]['id'];");
                for ($j = 0; $j < count($indicators); $j++) {
                    $sql = "INSERT INTO indicators (skill_id, indicator_name, description, user_id) " .
                        "VALUES ($newSkillID, '" . $indicators[$j]['indicator_name'] . "', '" . $indicators[$j]['description'] . "', $userID);";
                    DB::exec($sql);
                    //file_put_contents('_SQL_INSERT_INDICATOR_'.$i.' '.$j.'.txt', $sql);
                }
            }
        }
    }
    else {
        //оновлюємо вузли, що знаходяться правіше
        $sql = "UPDATE skill_tree SET left_key = left_key + 2, right_key = right_key + 2 " .
            "WHERE left_key > $parentGroupRightKey;";
        //file_put_contents('SQL_1.txt', $sql);
        DB::exec($sql);

        //оновлюємо батьківську гілку
        $sql = "UPDATE skill_tree SET right_key=right_key+2 " .
            "WHERE right_key >= $parentGroupRightKey AND left_key < $parentGroupRightKey;";
        //file_put_contents('SQL_2.txt', $sql);
        DB::exec($sql);

        //додаємо новий вузол
        $sql = "INSERT INTO skill_tree SET left_key = $parentGroupRightKey, right_key = " .
            ($parentGroupRightKey + 1) . ", node_level = " . ($parentGroupLevel + 1) .
            ", skill_name='$groupName', description='$groupDescription', node_type = 0, user_id = $userID;";
        //file_put_contents('SQL_3.txt', $sql);
        DB::exec($sql);
    }

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
    //file_put_contents('START.txt', "$groupID, $parentGroupID, $groupName, $groupDescription, $isMove");
    //file_put_contents('START2.txt', 'start');

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

    if($item[0]['node_level'] == 1){
        $sql = "DELETE FROM skill_tree WHERE left_key > $left_key AND right_key < $right_key;";
        DB::exec($sql);

        $sql = "UPDATE skill_tree SET left_key = 1, right_key = 2 WHERE id = $id;";
        //file_put_contents('ROOT.txt', $sql);
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
