<?php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use Firebase\JWT\JWT;

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

$app->put('/auth/{id}', function ($request, $response, $args) {
    $data = json_decode($args['id'], true);
    $expireTime = 60 * 60;
    $login = isset($data['login']) ? $data['login'] : '';
    $password = isset($data['password']) ? $data['password'] : '';

    $userData = DB::fetchAll("SELECT * FROM users WHERE login='".$login."' AND password='".$password."';");

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
                'firstName' => $userData[0]['firstname'],
                'secondName' => $userData[0]['secondname'],
                'organization' => $userData[0]['organization'],
                'lastActionID' => $userData[0]['lastActionID']
            ],
            'token' => $token
        ]));

    } else {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode([
            'error' => 'Invalid login'
        ]));
    }

    //file_put_contents('LOGIN.txt', $response);
    return $response;
});

$app->post("/auth", function (Request $request, Response $response, $args) {

    $input = $request->getParsedBody();

    $id = $input['userID'];
    $login = $input['login'];
    $password = $input['password'];
    $firstName = $input['firstName'];
    $secondName = $input['secondName'];
    $organization = $input['organization'];
    $changePassword = $input['changePassword'];

    //create
    if($id == -1) {
        $sql = "INSERT INTO users SET login='" . $login . "', password='" . $password . "', firstName='" .
            $firstName . "', secondName='" . $secondName . "', organization='" . $organization . "';";
        DB::exec($sql);
    }
    //edit
    else{
        if($changePassword) {
            $sql = "UPDATE users SET password='" . $password . "', firstName='" .
                $firstName . "', secondName='" . $secondName . "', organization='" . $organization .
                "' WHERE id=" . $id . ";";
            //file_put_contents('EDIT_USER.txt', $sql);
        }
        else{
            $sql = "UPDATE users SET firstName='" . $firstName . "', secondName='" .
                $secondName . "', organization='" . $organization .
                "' WHERE id=" . $id . ";";
        }
        DB::exec($sql);
    }
    return $response;
});

$app->run();