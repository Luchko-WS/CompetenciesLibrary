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

function getPath($id){
    $itemInfo = DB::fetchAll("SELECT * FROM skill_tree WHERE id=" . $id .";");
    $leftKey = $itemInfo[0]['left_key'];
    $rightKey = $itemInfo[0]['right_key'];

    $parentGroups = DB::fetchAll("SELECT * FROM skill_tree".
        " WHERE left_key<=" . $leftKey ." AND right_key>=". $rightKey .
        " ORDER BY left_key;");
    $path = "";
    for($j = 0; $j < count($parentGroups); $j++){
        $path .= "/".$parentGroups[$j]['skill_name'];
    }
    return $path;
}

function getSkillName($id){
    $skillInfo = DB::fetchAll("SELECT * FROM skill_tree WHERE id=" . $id .";");
    $path = $skillInfo[0]['skill_name'];
    return $path;
};

function getUserName($userID){
    $user = DB::fetchAll("SELECT * FROM users WHERE id = $userID;");
    $userName = $user[0]['firstname']." ".$user[0]['secondname'];
    return $userName;
}

$app->get('/params/{id}', function (Request $request, Response $response, $args) {
    $input = json_decode($args['id'], true);

    if($input['actionID'] == 'ALL_ACTIONS') {
        $rowsActions = DB::fetchAll("SELECT * FROM actions");

        for($i = 0; $i < count($rowsActions); $i++){
            $rowsActions[$i]['user'] = getUserName($rowsActions[$i]['user_id']);
            if($rowsActions[$i]['action_type'] != 'remove') {
                $rowsActions[$i]['path'] = getPath($rowsActions[$i]['new_parent_id']);
            }
        }
        $response->getBody()->write('{"data":' . json_encode($rowsActions) . '}');
    }
    else if($input['actionID'] == 'COUNT_OF_ACTIONS'){
        $rowsActions = DB::fetchAll("SELECT * FROM actions WHERE id > ".$input['lastActionID']." AND user_id <> ".$input['userID'].";");
        file_put_contents('COUNT OF ACTION.txt', "SELECT * FROM actions WHERE id > ".$input['lastActionID']." AND user_id <> ".$input['userID'].";");
        $response->getBody()->write('{"data":' . json_encode(count($rowsActions)) . '}');
    }
    else{
        $rowAction = DB::fetchAll("SELECT * FROM actions WHERE id=".$input['actionID'].";");
        $rowAction[0]['user'] = getUserName($rowAction[0]['user_id']);

        if($rowAction[0]['item_type'] == 'indicator'){
            $rowAction[0]['skill_name'] = getSkillName($rowAction[0]['new_parent_id']);
        }
        if($rowAction[0]['action_type'] != 'remove') {
            $rowAction[0]['path'] = getPath($rowAction[0]['new_parent_id']);
        }
        $response->getBody()->write('{"data":' . json_encode($rowAction) . '}');
    }
});

$app->post('/params', function ($request, $response, $args) {
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
        $sql = "INSERT INTO actions SET state=0, action_type = '$actionType', item_type = '$itemType', item_id = $itemID, item_name = '$itemName', ".
            "new_item_name = '$newItemName', new_item_description = '$newItemDescription', new_parent_id = $newParentID, user_id = $userID;";
        file_put_contents('ACTION EDIT.txt', $sql);
        DB::exec($sql);
    }
    else{
        $sql = "INSERT INTO actions SET state=0, action_type = '$actionType', item_type = '$itemType', item_id = $itemID, item_name = '$itemName', ".
            "new_item_description = '$newItemDescription', new_parent_id = $newParentID, user_id = $userID;";
        file_put_contents('ACTION ANOTHER.txt', $sql);
        DB::exec($sql);
    }

    return $this->response->withJson($input);
});

$app->put('/params/{id}', function ($request, $response, $args) {
    $input = json_decode($args['id'], true);
    $sql = "UPDATE actions SET state=".$input['state']." WHERE id=".$input['actionID'].";";
    //file_put_contents('000111.txt', $sql);
    DB::exec($sql);
    return $this->response->withJson($input);
});

$app->delete('/params/[{id}]', function (Request $request, Response $response, $args) {
    $input = $request->getAttribute('id');
    $id = $input;

    $sql = "DELETE FROM actions WHERE id = $id;";
    file_put_contents('DELETE ACTION.txt', $sql);
    DB::exec($sql);
    return $this->response->true;
});

$app->run();
