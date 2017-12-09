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

function getPath($id){
    $itemInfo = DB::fetchAll("SELECT * FROM object_tree WHERE id=" . $id .";");
    $leftKey = $itemInfo[0]['left_key'];
    $rightKey = $itemInfo[0]['right_key'];

    $parentGroups = DB::fetchAll("SELECT * FROM object_tree".
        " WHERE left_key<=" . $leftKey ." AND right_key>=". $rightKey .
        " ORDER BY left_key;");
    $path = "";
    for($j = 0; $j < count($parentGroups); $j++){
        $path .= "/".$parentGroups[$j]['name'];
    }
    return $path;
}

//file_put_contents(filename, body);
//Отримання дій
$app->get('/params/{id}', function (Request $request, Response $response, $args) {
    $input = json_decode($args['id'], true);
    $actionID = $input['actionID'];
    //Ініціалізація даних дій для користувача (при вході в систему)
    //Отримуються кількість нових дій, діапазон дій для відображення
    if($actionID == 'init'){
        $userID = $input['userID'];
        $userInfo = DB::fetchAll("SELECT * FROM users WHERE id = $userID;");
        $firstActionID = $userInfo[0]['first_action_id'];
        $lastActionID = $userInfo[0]['last_action_id'];
        $countOfNewActions = DB::fetchAll("SELECT * FROM actions WHERE id > $lastActionID AND user_id <> $userID;");
        $info['firstActionID'] = $firstActionID;
        $info['lastActionID'] = $lastActionID;
        $info['count'] = count($countOfNewActions);
        $response->getBody()->write('{"data":' . json_encode($info) . '}');
    }
    //Усі дії
    else if($actionID == 'ALL_ACTIONS') {
        if($input['firstActionID']) {
            $rowsActions = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = a.user_id) <> 0, ".
            "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = a.user_id), 'невідомий') AS user ".
            "FROM actions a WHERE a.id > ".$input['firstActionID']." ORDER BY a.id DESC;");
        }
        else{
            $rowsActions = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = a.user_id) <> 0, ".
            "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = a.user_id), 'невідомий') AS user ".
            "FROM actions a ORDER BY a.id DESC;");
        }
        $response->getBody()->write('{"data":' . json_encode($rowsActions) . '}');
    }
    //Конкретна дія
    else{
        $rowAction = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = a.user_id) <> 0, ".
        "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = a.user_id), 'невідомий') AS user ".
        "FROM actions a WHERE a.id = $actionID;");

        if($rowAction[0]['item_type'] == 'indicator'){
            $object = DB::fetchAll("SELECT * FROM object_tree WHERE id = " . $rowAction[0]['new_parent_id'] .";");
            $rowAction[0]['objectName'] = $object[0]['name'];
        }
        if($rowAction[0]['action_type'] != 'remove') {
            $rowAction[0]['path'] = getPath($rowAction[0]['new_parent_id']);
        }
        $response->getBody()->write('{"data":' . json_encode($rowAction) . '}');
    }
});

//Створення дії
$app->post('/params', function (Request $request, Response $response, $args) {
    date_default_timezone_set('Europe/Kiev');
    $now = date("d.m.y G:i");

    $input = $request->getParsedBody();
    $actionType = $input['actionType'];
    $itemType = $input['itemType'];
    $itemID  = $input['itemID'];
    $itemName  = $input['itemName'];
    $newItemName  = $input['newItemName'];
    $newItemDescription  = $input['newItemDescription'];
    $newParentID  = $input['newParentID'];
    $userID = $input['userID'];

    if($actionType == 'edit'){
        $sql = "INSERT INTO actions SET state = 0, action_type = '$actionType', item_type = '$itemType', item_id = $itemID, item_name = '$itemName', ".
            "new_item_name = '$newItemName', new_item_description = '$newItemDescription', new_parent_id = $newParentID, user_id = $userID, creation_date = '$now';";
        DB::exec($sql);
    }
    else{
        $sql = "INSERT INTO actions SET state = 0, action_type = '$actionType', item_type = '$itemType', item_id = $itemID, item_name = '$itemName', ".
            "new_item_description = '$newItemDescription', new_parent_id = $newParentID, user_id = $userID, creation_date = '$now';";
        DB::exec($sql);
    }
    return $this->response->withJson($input);
});

//Оновлення стану дії
$app->put('/params/{id}', function (Request $request, Response $response, $args) {
    $input = json_decode($args['id'], true);
    $state = $input['state'];
    $actionID = $input['actionID'];
    $sql = "UPDATE actions SET state = $state WHERE id = $actionID;";
    DB::exec($sql);
    return $this->response->withJson($input);
});

//Видалення дії
$app->delete('/params/[{id}]', function (Request $request, Response $response, $args) {
    $input = $request->getAttribute('id');
    $id = $input;
    $sql = "DELETE FROM actions WHERE id = $id;";
    DB::exec($sql);
    return $this->response->true;
});

$app->run();
