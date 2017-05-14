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

    if($input['exportToFile'] != "NONE") {

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
            $sheet->mergeCells('A1:C1');
            $sheet->getStyle('A1')->getAlignment()->
                setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
            $sheet->setCellValue("A2", 'Назва компетенцій');
            $sheet->setCellValue("B2", 'Назва індикатору');
            $sheet->setCellValue("C2", 'Опис індикатору');

            $r = 3;
            for($i = 0; $i < count($rows); $i++) {
                $sheet->setCellValueByColumnAndRow(0, $r, $rows[$i]['skill_name']);
                for($j = 0; $j < count($rows[$i]['indicators']); $j++) {
                    $sheet->setCellValueByColumnAndRow(1, $r, $rows[$i]['indicators'][$j]['indicator_name']);
                    $sheet->setCellValueByColumnAndRow(2, $r, $rows[$i]['indicators'][$j]['description']);
                    $r++;
                }
            }
            $objWriter = new PHPExcel_Writer_Excel5($xls);
            $objWriter->save('TestExcel.xls');
        }
    }
    //отримуємо дерево (каталогів чи компетенцій)
    else if($input['tree'] != 'NONE'){
        if($input['tree'] == 'GROUPS'){
            $rows = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type=0 AND node_level <> 1 ORDER BY left_key");
            $response->getBody()->write('{"data":'.json_encode($rows).'}');
        }
        else if($input['tree'] == 'SKILLS'){
            $rows = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type=1 ORDER BY left_key");
            $response->getBody()->write('{"data":'.json_encode($rows).'}');
        }
    }
    //отримуємо всі компетенції і їх критерії
    else if($input["skill"] == "ALL_SKILLS" && $input['indicator'] == 'ALL_INDICATORS') {
        $rowsSkills = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type=1;");

        for($i = 0; $i < count($rowsSkills); $i++) {
            $rowIndicators = DB::fetchAll("SELECT * FROM indicators WHERE skill_id=".$rowsSkills[$i]['id']);
            $rowsSkills[$i]['indicators'] = $rowIndicators;
        }

        $data['rows'] = $rowsSkills;

        //file_put_contents('request.txt', '{"data":'.json_encode($rows).'}');
        $response->getBody()->write('{"data":'.json_encode($data).'}');
    }
    //отримуємо конкретну компетенцію і її критерії
    else if($input["skill"] != "ALL_SKILLS" && $input['indicator'] == 'ALL_INDICATORS') {

        $rowsSkills = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type=1 && id=".$input["skill"]);
        $rowIndicators = DB::fetchAll("SELECT * FROM indicators WHERE skill_id=".$input["skill"]);
        $rowsSkills[0]['indicators'] = $rowIndicators;

        $response->getBody()->write('{"data":'.json_encode($rowsSkills).'}');
    }
    //отримуємо конкретний критерій
    else if($input["skill"] != "ALL_SKILLS" && $input['indicator'] != 'ALL_INDICATORS') {

        $rowsSkills = DB::fetchAll("SELECT * FROM skill_tree WHERE node_type=1 && id=".$input["skill"]);
        $rowIndicators = DB::fetchAll("SELECT * FROM indicators WHERE id="
            .$input['indicator']." AND skill_id=".$input["skill"]);
        $rowsSkills[0]['indicators'] = $rowIndicators;

        $response->getBody()->write('{"data":'.json_encode($rowsSkills).'}');
    }
    return $response;
});

$app->post('/params', function (Request $request, Response $response, $args) {
    $input = $request->getParsedBody();

    //працюємо з компетенціями
    if($input['obj'] == 'SKILL') {

        $skillId = $input['skillId'];
        $skillName = $input['skillName'];
        $groupRightKey = 100; //$input['groupRightKey'];
        $groupLevel = 100; //$input['groupLevel'];
        $skillDescription = $input['skillDescription'];

        //редагування компетенції
        if ($skillId != -1) {
            $sql = "UPDATE skill_tree SET skill_name='".$skillName.
                "', description='".$skillDescription."' WHERE  id=".$skillId.";";
            DB::exec($sql);
            //переміщення компетенції
        }
        //створення компетенції
        else {
            //оновлюємо вузли, що знаходяться правіше
            $sql = "UPDATE skill_tree SET left_key=left_key+2, right_key=right_key+2 ".
              "WHERE left_key > ".$groupRightKey.";";
            DB::exec($sql);
            //file_put_contents('add_skill 1.txt', $sql);

            //оновлюємо батьківську гілку
            $sql = "UPDATE skill_tree SET right_key=right_key+2 ".
              "WHERE right_key>=".$groupRightKey." AND left_key<".$groupRightKey.";";
            DB::exec($sql);
            //file_put_contents('add_skill 2.txt', $sql);

            //додаємо новий вузол
            $sql = "INSERT INTO skill_tree SET left_key=".$groupRightKey.", right_key=".($groupRightKey + 1).", node_level=".
                ($groupLevel + 1).", skill_name='".$skillName."', description='".$skillDescription."', node_type=1;";
            DB::exec($sql);
            //file_put_contents('add_skill 3.txt', $sql);

        }
    }
    //працюємо з критеріями
    else if($input['obj'] == 'INDICATOR'){
        $skillId = $input['skillId'];
        $indicatorId = $input['indicatorId'];
        $indicatorName = $input['indicatorName'];
        $indicatorDescription = $input['indicatorDescription'];

        //редагування індикатору
        if ($indicatorId != -1) {
            $sql = "UPDATE indicators SET indicator_name='".$indicatorName.
                "', description='".$indicatorDescription.
                "', skill_id=".$skillId." WHERE  id=".$indicatorId.";";
            DB::exec($sql);
        }
        //створення індикатору
        else {
            $sql = "INSERT INTO indicators (skill_id, indicator_name, description)".
              "VALUES (".$skillId.", '".$indicatorName."', '".$indicatorDescription."');";
            DB::exec($sql);
        }
    }
    return $this->response->withJson($input);
});

/*
$app->put('/params/[{id}]', function (Request $request, Response $response, $args) {
    $input = $request->getParsedBody();
    file_put_contents('put.txt', $input);

    //$cityID = $input['city']['id'];
    //$cityName = $input['inputCityName'];
    //$sql = "UPDATE `params` SET `name`='" . $input['name'] . "' WHERE  `id`=" . $args['id'] . ";";
    //$params = DB::exec($sql);
    //$input['id'] = $args['id'];
    return $this->response->withJson($input);
});
*/

$app->delete('/params/[{id}]', function (Request $request, Response $response, $args) {
    $input = $request->getAttribute('id');
    $tokens = explode(",", $input);
    $objType = $tokens[1];
    $id = $tokens[0];

    if($objType == "SKILL") {
        $item = DB::fetchAll("SELECT * FROM skill_tree WHERE id=".$id.";");
        $left_key = $item[0]['left_key'];
        $right_key = $item[0]['right_key'];

        $sql = "DELETE FROM skill_tree WHERE left_key >= ".$left_key." AND right_key <= ".$right_key.";";
        DB::exec($sql);

        $sql = "UPDATE skill_tree SET left_key = IF(left_key > ".$left_key.", left_key - (".$right_key." - ".
            $left_key." + 1), left_key), right_key = right_key - (".$right_key." - ".
            $left_key." + 1) WHERE right_key > ".$right_key.";";
        DB::exec($sql);
    }
    else if($objType == "INDICATOR"){
        $sql = "DELETE FROM indicators WHERE id=".$id.";";
        DB::exec($sql);
    }
    else{

    }
    return $this->response->true;
});

$app->run();
