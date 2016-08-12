<?php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use Firebase\JWT\JWT;

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

$app->add(new \Slim\Middleware\JwtAuthentication([
//    "logger" => $logger,
    "secret" => 0,
    "rules" => [
        new \Slim\Middleware\JwtAuthentication\RequestPathRule([
//            "path" => "/api",
            "passthrough" => ["/auth"]
        ]),
        new \Slim\Middleware\JwtAuthentication\RequestMethodRule([
            "passthrough" => ["OPTIONS"]
        ])
    ]
]));

//file_put_contents(filename, body);
//Вхід користувача в систему
$app->put('/auth/{id}', function (Request $request, Response $response, $args) {
    $data = json_decode($args['id'], true);
    $expireTime = 60 * 60;
    $login = isset($data['login']) ? $data['login'] : '';
    $password = isset($data['password']) ? $data['password'] : '';

    $userData = DB::fetchAll("SELECT * FROM users WHERE login='$login' AND password='$password';");
    if ($userData) {
        $token = JWT::encode([
            "iss" => 1,
            'exp' => time() + $expireTime,
            'nbf' => time()
        ],
            0
        );
        $response->getBody()->write(json_encode([
            'user' => [
                'id' => $userData[0]['id'],
                'login' => $userData[0]['login'],
                'firstName' => $userData[0]['first_name'],
                'secondName' => $userData[0]['second_name'],
                'organization' => $userData[0]['organization'],
                'firstActionID' => $userData[0]['first_action_id'],
                'lastActionID' => $userData[0]['last_action_id']
            ],
            'token' => $token
        ]));
    } else {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode([
            'error' => 'Invalid login'
        ]));
    }
    return $response;
});

//Збереження/редагування даних користувача
$app->post("/auth", function (Request $request, Response $response, $args) {

    $input = $request->getParsedBody();
    $id = $input['userID'];
    $login = $input['login'];
    $password = $input['password'];
    $firstName = $input['firstName'];
    $secondName = $input['secondName'];
    $organization = $input['organization'];
    $changePassword = $input['changePassword'];
    $firstActionID = $input['firstActionID'];
    $lastActionID = $input['lastActionID'];

    //Встановлення першої дії для користувача
    if($firstActionID){
        $sql = "UPDATE users SET first_action_id = $firstActionID WHERE id = $id;";
        DB::exec($sql);
        $sql = "DELETE FROM actions WHERE id <= $firstActionID AND user_id=$id;";
        DB::exec($sql);
    }
    //Встановлення останньої дії для користувача
    else if($lastActionID){
        $sql = "UPDATE users SET last_action_id = $lastActionID WHERE id = $id;";
        DB::exec($sql);
    }
    //Створення користувача
    else if($id == -1) {
        $sql = "INSERT INTO users SET login = '$login', password = '$password', first_name = '$firstName', ".
            "second_name = '$secondName', organization = '$organization';";
        DB::exec($sql);
    }
    //Редагування користувача
    else{
        //Змнений пароль
        if($changePassword) {
            $sql = "UPDATE users SET password = '$password', first_name = '$firstName', ".
                "second_name = '$secondName', organization = '$organization' WHERE id = $id;";
        }
        else{
            $sql = "UPDATE users SET first_name = '$firstName', second_name = '$secondName', ".
                "organization = '$organization' WHERE id = $id;";
        }
        DB::exec($sql);
    }
    return $response;
});

//Видалення користувача
$app->delete('/auth/[{id}]', function (Request $request, Response $response, $args) {
    $input = $request->getAttribute('id');
    $id = $input;
    $sql = "DELETE FROM users WHERE id = $id;";
    DB::exec($sql);
    return $this->response->true;
});

$app->run();