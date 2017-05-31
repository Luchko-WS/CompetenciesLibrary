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

    $rows = DB::fetchAll("SELECT * FROM skill_tree ORDER BY left_key");

    for($i = 0; $i < count($rows); $i++) {
        $rowIndicators = DB::fetchAll("SELECT * FROM indicators WHERE skill_id=".$rows[$i]['id']);
        $rows[$i]['indicators'] = $rowIndicators;
    }

    if($input['exportToFile'] == "JSON") {
        file_put_contents('exportFile.json', json_encode($rows));
    }
    else if($input['exportToFile'] == "XLS") {
        $xls = new PHPExcel();
        $xls->setActiveSheetIndex(0);
        $sheet = $xls->getActiveSheet();
        $sheet->setTitle('Бібліотека компетенцій');

        $sheet->setCellValue("A1", 'Бібліотека компетенцій');
        $sheet->getStyle('A1')->getFill()->setFillType(PHPExcel_Style_Fill::FILL_SOLID);
        $sheet->mergeCells('A1:D1');
        $sheet->getStyle('A1')->getAlignment()->
            setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
        $sheet->setCellValue("A2", 'Назва компетенцій');
        $sheet->setCellValue("B2", 'Опис компетенцій');
        $sheet->setCellValue("C2", 'Назва індикатору');
        $sheet->setCellValue("D2", 'Опис індикатору');

        $rowId = 3;
        for($i = 0; $i < count($rows); $i++) {

            if(count($rows[$i]['indicators']) == 0){

                if($rows[$i]['node_type'] == 0){
                    $sheet->setCellValueByColumnAndRow(0, $rowId, $rows[$i]['skill_name']." (ГРУПА)");
                }
                else{
                    $sheet->setCellValueByColumnAndRow(0, $rowId, $rows[$i]['skill_name']);
                }
                $sheet->setCellValueByColumnAndRow(1, $rowId, $rows[$i]['description']);
                $rowId++;
            }

            for($j = 0; $j < count($rows[$i]['indicators']); $j++) {
                $sheet->setCellValueByColumnAndRow(0, $rowId, $rows[$i]['skill_name']);
                $sheet->setCellValueByColumnAndRow(1, $rowId, $rows[$i]['description']);
                $sheet->setCellValueByColumnAndRow(2, $rowId, $rows[$i]['indicators'][$j]['indicator_name']);
                $sheet->setCellValueByColumnAndRow(3, $rowId, $rows[$i]['indicators'][$j]['description']);
                $rowId++;
            }
        }
        $objWriter = new PHPExcel_Writer_Excel5($xls);
        $objWriter->save('TestExcel.xls');
    }

    return $response;
});

$app->post('/params', function (Request $request, Response $response, $args) {
    $input = $request->getParsedBody();
    return $this->response->withJson($input);
});

$app->delete('/params/[{id}]', function (Request $request, Response $response, $args) {

});

$app->run();
