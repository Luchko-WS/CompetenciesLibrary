<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require 'vendor/autoload.php';
require 'db.php';
require 'PHPExcel.php';

DB::init('mysql:dbname=prozorro;host=localhost;port=3306', 'root', 'WhiteShark28021995');

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

//export
$app->get('/params/{id}', function (Request $request, Response $response, $args) {

    $input = json_decode($args['id'], true);
    $itemID = $input['id'];
    if($itemID) {
        $item = DB::fetchAll("SELECT * FROM object_tree WHERE id = $itemID;");
        $leftKey = $item[0]['left_key'];
        $rightKey = $item[0]['right_key'];
        $rows = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = s.user_id) <> 0, ".
            "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = s.user_id), 'невідомий') AS user ".
            "FROM object_tree s WHERE s.left_key >= $leftKey AND s.right_key <= $rightKey ORDER BY s.left_key;");
    }
    else{
        $rows = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = s.user_id) <> 0, ".
            "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = s.user_id), 'невідомий') AS user ".
            "FROM object_tree s ORDER BY s.left_key;");
    }
    for($i = 0; $i < count($rows); $i++) {
        if($rows[$i]['node_type'] == 1) {
            $rowIndicators = DB::fetchAll("SELECT *, IF((SELECT COUNT(*) FROM users u WHERE u.id = i.user_id) <> 0, " .
                "(SELECT CONCAT(first_name, ' ', second_name) FROM users u WHERE u.id = i.user_id), 'невідомий') AS user " .
                "FROM indicators i WHERE i.object_id = " . $rows[$i]['id'] . ";");
            $rows[$i]['indicators'] = $rowIndicators;
        }
    }

    if($input['format'] == "JSON") {
        file_put_contents('exportFile.json', json_encode($rows));
    }
    else if($input['format'] == "XLS") {
        $xls = new PHPExcel();
        $xls->setActiveSheetIndex(0);
        $sheet = $xls->getActiveSheet();
        $sheet->setTitle('Бібліотека ієрархічних даних');
        $sheet->setCellValue("A1", 'Бібліотека ієрархічних даних');
        $sheet->getStyle('A1')->getFill()->setFillType(PHPExcel_Style_Fill::FILL_SOLID);
        $sheet->mergeCells('A1:D1');
        $sheet->getStyle('A1')->getAlignment()->
            setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
        $sheet->setCellValue("A2", "Назва об'єкта");
        $sheet->setCellValue("B2", "Опис об'єкта");
        $sheet->setCellValue("C2", 'Назва індикатору');
        $sheet->setCellValue("D2", 'Опис індикатору');

        $rowId = 3;
        for($i = 0; $i < count($rows); $i++) {

                if($rows[$i]['node_type'] == 0){
                    $sheet->setCellValueByColumnAndRow(0, $rowId, $rows[$i]['name']." (ГРУПА)");
                }
                else{
                    $sheet->setCellValueByColumnAndRow(0, $rowId, $rows[$i]['name']);
                }
                $sheet->setCellValueByColumnAndRow(1, $rowId, $rows[$i]['description']);
                $rowId++;

            if($rows[$i]['node_type'] == 1) {
                for ($j = 0; $j < count($rows[$i]['indicators']); $j++) {
                    $sheet->setCellValueByColumnAndRow(0, $rowId, $rows[$i]['name']);
                    $sheet->setCellValueByColumnAndRow(1, $rowId, $rows[$i]['description']);
                    $sheet->setCellValueByColumnAndRow(2, $rowId, $rows[$i]['indicators'][$j]['name']);
                    $sheet->setCellValueByColumnAndRow(3, $rowId, $rows[$i]['indicators'][$j]['description']);
                    $rowId++;
                }
            }
        }
        $objWriter = new PHPExcel_Writer_Excel5($xls);
        $objWriter->save('ExportFile.xls');
    }
    return $response;
});

//import
$app->put('/params/{id}', function (Request $request, Response $response, $args) {
    date_default_timezone_set('Europe/Kiev');
    $now = date("d.m.y G:i");

    $input = json_decode($args['id'], true);
    $root = $input['root'];
    $parent = $input['parent'];

    //оновлюємо вузли, що знаходяться правіше
    $sql = "UPDATE object_tree SET left_key = left_key + 2, right_key = right_key + 2 ".
        "WHERE left_key > ".$parent['right_key'].";";
    DB::exec($sql);

    //оновлюємо батьківську гілку
    $sql = "UPDATE object_tree SET right_key = right_key + 2 ".
        "WHERE right_key >= ".$parent['right_key']." AND left_key < ".$parent['right_key'].";";
    DB::exec($sql);

    $sql = "INSERT INTO object_tree SET left_key = ".$parent['right_key'].", right_key = " . ($parent['right_key'] + 1) .
        ", node_level = ". ($parent['node_level'] + 1). ", name = '".$root['name']."', description = '" .
        $root['description']."', node_type = ".$root['node_type'].", user_id = ".$root['user_id'].", creation_date = '$now';";
    DB::exec($sql);

    $node = DB::fetchAll("SELECT * FROM object_tree WHERE left_key = ".$parent['right_key']." AND right_key = ".($parent['right_key'] + 1).";");
    $rootNode = $node[0];
    file_put_contents('IO.txt', $rootNode);

    return $this->response->withJson($rootNode);
});

$app->post('/params', function (Request $request, Response $response, $args) {
    $input = $request->getParsedBody();
    //file_put_contents('import1.txt', $input['itemID']);
    //file_put_contents('import2.txt', $input['data'][0]['name']);
    /**
     * Потрібно перевіряти чи правильна структура даних
     */
    return $this->response->withJson($input);
});

$app->delete('/params/[{id}]', function (Request $request, Response $response, $args) {

});

$app->run();
