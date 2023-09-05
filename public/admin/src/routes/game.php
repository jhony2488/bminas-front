<?php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Firebase\JWT\JWT;

function explodeLabel($label)
{
    if (strpos($label, "º") !== false) {
        $label = str_replace("º", " ao ", $label);
        $label = str_replace("P", "", $label);
        $label = substr($label, 0, -4);
    }
    if (strpos($label, " ao ") !== false) {
        $array = explode(" ao ", $label);
        $x = 1;
        while ($x <= $array[1]) {
            $array2[] = $x;
            $x++;
        }
        return $array2;
    } else if (strpos($label, ",") !== false) {
        $array = explode(",", $label);
        return $array;
    } else {
        return array(($label - 1) => $label);
    }
}

function factorial($number)
{
    $factorial = 1;
    for ($i = 1; $i <= $number; $i++) {
        $factorial = $factorial * $i;
    }
    return $factorial;
}
function getPermCount($letters, $count)
{
    $result = 1;
    for ($i = strlen($letters) - $count + 1; $i <= strlen($letters); $i++) {
        $result *= $i;
    }
    return $result;
}
function getPerm($letters, $count, $index)
{
    $result = '';
    for ($i = 0; $i < $count; $i++) {
        $pos = $index % strlen($letters);
        $result .= $letters[$pos];
        $index = ($index - $pos) / strlen($letters);
        $letters = substr($letters, 0, $pos) . substr($letters, $pos + 1);
    }
    return $result;
}

function getCombinations($modality, $numbers)
{
    $gameType = 0;
    $combination = 1;
    if ($modality == "DZC") {
        $group = 2;
        $gameType = 1;
    } else if ($modality == "CC") {
        $group = 3;
        $gameType = 1;
    } else if ($modality == "MM" || $modality == "MCC") {
        $group = 4;
        $gameType = 1;
    } else if ($modality == "DGC" || $modality == "DDZC" || $modality == "PASC" || $modality == "PVVC") {
        $group = 2;
        $gameType = 2;
    } else if ($modality == "TGC" || $modality == "TDZC") {
        $group = 3;
        $gameType = 2;
    } else if ($modality == "QGC") {
        $group = 4;
        $gameType = 2;
    } else if ($modality == "QG5C") {
        $group = 5;
        $gameType = 2;
    }

    if ($gameType == 1) {
        $count = getPermCount($numbers, $group);
        for ($i = 0; $i < $count; $i++) {
            $array[] = getPerm($numbers, $group, $i) . '<br>';
        }
        $combination = count(array_unique($array));
    } else if ($gameType == 2) {
        $count = count(explode(",", $numbers));
        $fac1 = factorial($count);
        $fac2 = factorial($group);
        $combination = ($fac1 / ($fac2 * factorial($count - $group)));
    }

    return $combination;
}

function getPrizeValue($modality, $price, $label, $betAndBonus, $combination)
{
    $prizeValue = 0;
    $labelSize = count(explodeLabel($label));
    $price = $price;
    if (($modality == "DGC" || $modality == "DG") && $label == '1 ao 2' || $label == '2 ao 3' || $label == '3 ao 4' || $label == '4 ao 5') {
        $price = 180;
    }
    if (($modality == "TGC" || $modality == "TG") && $labelSize == 3) {
        $price = 1500;
    }
    if (($modality == "QGC" || $modality == "QG") && $labelSize == 4) {
        $price = 4000;
    }

    if ($modality == "G" || $modality == "U" || $modality == "M" || $modality == "C" || $modality == "DZ") {
        $prizeValue = ($betAndBonus * $price) / $labelSize;
    }
    if ($modality == "MC") {
        $prizeValue = (($betAndBonus * $price) / $labelSize) / 2;
    }
    if ($modality == "QG" || $modality == "QG5" || $modality == "DG" ||  $modality == "TG" || $modality == "DDZ" || $modality == "TDZ" || $modality == "PAS" || $modality == "PVV") {
        $prizeValue = $betAndBonus * $price;
    }
    if ($modality == "DGC" || $modality == "TGC" || $modality == "QGC" || $modality == "QG5C" || $modality == "DDZC" || $modality == "TDZC" || $modality == "PASC" || $modality == "QG5C" || $modality == "PVVC") {
        $prizeValue = ($betAndBonus * $price) / $combination;
    }
    if ($modality == "DZC" || $modality == "CC" || $modality == "MM") {
        $prizeValue = (($betAndBonus * $price) / $labelSize) / $combination;
    }
    if ($modality == "MCC") {
        $prizeValue = ((($betAndBonus * $price) / $labelSize) / $combination) / 2;
    }

    return [$prizeValue, $price];
}

function checkInvalidGame($curStatus, $fetch, $betAmount, $arrayNumbers, $arrayLottery, $col_label, $type_mod)
{

    if ($col_label != '1 ao 5' && $col_label != '1 ao 6' && $col_label != '1 ao 7') {
        $maxValue = str_replace(".", ",", $fetch->aceite);
        $limite_jogo = $fetch->aceite;
    }

    if ($col_label == '1 ao 5') {
        $maxValue = str_replace(".", ",", $fetch->aceite_1ao5);
        $limite_jogo = $fetch->aceite_1ao5;
    }

    if ($col_label == '1 ao 6' || $col_label == '1 ao 7') {
        $maxValue = str_replace(".", ",", $fetch->aceite_1ao7);
        $limite_jogo = $fetch->aceite_1ao7;
    }

    foreach ($arrayNumbers as $value) {
        // if ((int) $value < 0 || (int) $value > 25) { 
        //     $status = ["error" => true, "message" => "Jogo inválido."];
        // }
    }
    if ($betAmount < 0.1) {
        $status = ["error" => true, "message" => "Valor minimo para jogo: R$ 0,10."];
    }
    if ($type_mod != 'G' && $betAmount > $limite_jogo) {
        $status = ["error" => true, "message" => "Máximo de R$ $maxValue para esta modalidade."];
    }
    if ($type_mod == 'G' && $betAmount > $limite_jogo && $col_label != '1 ao 5' && $col_label != '1 ao 7') {
        $status = ["error" => true, "message" => "Máximo de R$ $maxValue para esta modalidade."];
    }

    if (!isset($arrayLottery)) {
        $status = ["error" => true, "message" => "Selecione quais loterias para jogar!"];
    }
    if ($betAmount == "") {
        $status = ["error" => true, "message" => "Insira uma quantidade válida para o jogo!"];
    }
    if (count($arrayNumbers) < $fetch->nros_min || count($arrayNumbers) > $fetch->nros_max) {
        $status = ["error" => true, "message" => "Máximo de $fetch->nros_max numeros e minimo de $fetch->nros_min."];
    }
    foreach ($arrayNumbers as $value) {
        if (!is_numeric($value)) {
            $status = ["error" => true, "message" => "Por favor, revise sua aposta!"];
        }
    }
    if ($curStatus["error"] == true) {
        return $curStatus;
    } else {
        $status = !isset($status) ? $curStatus : $status;
        return $status;
    }
}

function game($db, $getCookie, $postData, $label, $type)
{
    $arrayLottery = $postData['lottery'];
    $status = ["error" => false];
    $arrayNumbers = explode(",", $postData["numbers"]);
    $games = [];
    $totalPrice = 0;
    $totalPriceAll = 0;
    $dividedValue = 0;
    $prizeInfo = [];
    $bonus = 0;

    if (empty($postData['value'])) {
        $status = ["error" => true, "message" => "Insira uma quantia para o jogo!"];
    }
    if (empty($postData["numbers"])) {
        $status = ["error" => true, "message" => "Por favor, revise sua aposta!"];
    }

    $stmt = $db->prepare("SELECT * FROM users WHERE user_id = ?");
    $stmt->execute([$getCookie->sub]);
    $result = $stmt->fetch(PDO::FETCH_OBJ);

    $money = $result->debit_base;
    $jackpot = $result->debit_premio;
    $totalMoney = $money + $jackpot;
    $moneyLeft = [$money, $jackpot];

    if ($result->status == 0) {
        $token = array(
            "sts" => 0,
            "exp" => time() + 1800,
        );
        $jwt = JWT::encode($token, "6d65f7c9864bcd2a6e3932250ea515bc");
        setcookie("token", $jwt, time() + 1800, '/');
    }

    $stmt_cotadas = $db->query("SELECT * FROM apostas_cotadas");
    $apostas_cotadas = $stmt_cotadas->fetchAll(PDO::FETCH_COLUMN);

    if (!$status["error"]) {
        $postData["numbers"] = array_unique($postData["numbers"]);
        foreach ($postData["numbers"] as $numberKey => $number) {
            $combination = getCombinations($postData["game"], $number);

            $revert = false;
            if ($postData["game"] == "PVV") {
                $arrayPVV = explode(",", $number);
                if ($arrayPVV[0] == $arrayPVV[1]) {
                    $revert = true;
                    $postData["game"] = "PAS";
                }
            }

            if (array_search($number, $apostas_cotadas, true) !== false) {
                $status = ["error" => true, "message" => "Número ($number) pertencente à apostas cotadas, aposta inválida "];
            }

            if (!$status["error"]) {
                $stmt1 = $db->prepare("SELECT * FROM cotacoes WHERE sigla = ?");
                $stmt1->execute([$postData["game"]]);
                $result1 = $stmt1->fetch(PDO::FETCH_OBJ);
            }

            if ($type == "G") {
                $arrayNumbers = explode(",", $number);
            } else if ($type == "U") {
                $arrayNumbers = str_split($number);
            }
           
            if (!$status["error"]) {
                foreach ($postData['value'] as $valueKey => $value) {
                    if ($value != null) {
                        if ($postData['valueOptions'][$valueKey] == "all") {
                            $dividedValue = floor(($value / count($postData["numbers"])) * 100) / 100;
                            $status = checkInvalidGame($status, $result1, $dividedValue, $arrayNumbers, $arrayLottery, $$label[$valueKey], $type);
                            $totalPriceAll += $dividedValue;
                        } else {
                            $status = checkInvalidGame($status, $result1, $value, $arrayNumbers, $arrayLottery, $label[$valueKey], $type);
                        }

                        if (!$status["error"]) {
                            $envLottery = [];
                            foreach ($arrayLottery as $lottery) {
                                $stmt2 = $db->prepare("SELECT horario_limite AS max_time, descricao FROM loterias WHERE loteria_id = ?");
                                $stmt2->execute([$lottery]);
                                $result2 = $stmt2->fetch(PDO::FETCH_OBJ);
                                $envLottery[] = $result2->descricao;

                                if (date('H:i') > $result2->max_time) {
                                    $status = ["error" => true, "message" => "Loteria $result2->descricao indisponivel."];
                                }

                                $stmtSUM = $db->prepare("SELECT SUM(IF(modalidade_id IN(15,16,13,14,22,23,19,26,17,27,18,28,11,25,12,24), valor, IF(colocacao_label = '1 ao 5', valor / 5, valor))) AS total
                                    FROM `jogos` WHERE situacao = 1 AND numeros = ? AND loteria = ? AND conferido = 0");
                                $stmtSUM->execute([$number, $lottery]);
                                $resultSUM = $stmtSUM->fetch(PDO::FETCH_OBJ);

                                $stmtAceite = $db->prepare("SELECT aceite_1ao5,aceite_1ao7 FROM cotacoes WHERE sigla = ?");
                                $stmtAceite->execute([$postData["game"]]);
                                $resultAceite = $stmtAceite->fetch(PDO::FETCH_OBJ);

                                if ($postData["game"] == "G") {
                                    if ($label[$valueKey] == "1 ao 5" && $value > $resultAceite->aceite_1ao5) {
                                        $status = ["error" => true, "message" => "Máximo de R$ $resultAceite->aceite_1ao5 para esta modalidade de 1.º ao 5.º prêmio"];
                                    }

                                    if ($label[$valueKey] == "1 ao 7" && $value > $resultAceite->aceite_1ao7) {
                                        $status = ["error" => true, "message" => "Máximo de R$ $resultAceite->aceite_1ao7 para esta modalidade de 1.º ao 7.º prêmio"];
                                    }
                                    $stmtGameLimit = $db->prepare("SELECT numeros FROM `jogos` a 
                                        WHERE a.situacao = 1 AND numeros = ? AND modalidade_id = 1 AND usuario_id = ? AND loteria = ? AND conferido = 0 AND colocacao_label = ? LIMIT 1");
                                    $stmtGameLimit->execute([$number, $getCookie->sub, $lottery, $label[$valueKey]]);
                                    $resultGameLimit = $stmtGameLimit->fetchAll(PDO::FETCH_COLUMN);
                                    if (count($resultGameLimit) > 0) {
                                        $status = ["error" => true, "message" => "Aposta duplicada ($number), realize uma aposta nova ou estorne a anterior."];
                                    }

                                    $stmtMatingale = $db->prepare("SELECT count(*) AS qtd, IFNULL(MAX(a.valor), 0) AS max_valor FROM `jogos` a WHERE a.situacao = 1 AND numeros = ? AND modalidade_id = 1 AND usuario_id = ? AND valor > 50
                                        AND a.data > IFNULL((SELECT max(data) FROM `sorteios` a LEFT JOIN loterias b ON a.loteria_id = b.loteria_id WHERE a.grupo1 = ? AND b.grupo = (SELECT c.grupo FROM loterias c WHERE c.loteria_id = ?)), DATE_SUB(NOW(), INTERVAL 30 DAY))");
                                    $stmtMatingale->execute([$number, $getCookie->sub, $number, $lottery]);
                                    $resultMatingale = $stmtMatingale->fetch(PDO::FETCH_OBJ);
                                    if ($resultMatingale->qtd >= 3) {
                                        $matingale = true;
                                    }
                                }

                                if (!$status["error"]) {
                                    setlocale(LC_MONETARY, "pt_BR", "ptb");
                                    if ($postData['valueOptions'][$valueKey] == "all") {
                                        if ($matingale == true && $dividedValue > $resultMatingale->max_valor && $resultMatingale->max_valor > 50) {
                                            $status = ["error" => true, "message" => "Máximo de 2 aumentos para apostas acima de R$ 50,00 ($number). Realize uma aposta igual ou menor que " . money_format('%.2n', $resultMatingale->max_valor) . "."];
                                        }
                                        if ($type == "G") {
                                            if (($resultSUM->total + $dividedValue) > $result1->aceite_limite) {
                                                $status = ["error" => true, "message" => "Limite máximo atingido para esta aposta ($number) na loteria $result2->descricao."];
                                            }
                                        } else if ($type == "U") {
                                            if ($label[$valueKey] == '1 ao 5') {
                                                if (($resultSUM->total + ($dividedValue / 5)) > $result1->aceite_limite) {
                                                    $status = ["error" => true, "message" => "Limite máximo atingido para esta aposta ($number) na loteria $result2->descricao."];
                                                }
                                            } else {
                                                if (($resultSUM->total + $dividedValue) > $result1->aceite_limite) {
                                                    $status = ["error" => true, "message" => "Limite máximo atingido para esta aposta ($number) na loteria $result2->descricao." . $dividedValue / 5];
                                                }
                                            }
                                        }
                                        $bonus = ($dividedValue * ($result1->bonus / 100));
                                        $prizeInfo = getPrizeValue($postData["game"], $result1->cotacao, $label[$valueKey], $dividedValue + $bonus, $combination);
                                        $games[] = [$number, $dividedValue, $lottery, date("Y-m-d"), $label[$valueKey], $bonus, $result1->modalidade_id, $bonus + $dividedValue, $getCookie->sub, $prizeInfo[1], date("Y-m-d H:i:s"), date("Y-m-d H:i:s"), $combination, $prizeInfo[0], "Jogo: " . $postData["game"] . " Cotação: $result1->cotacao " . "Colocação: $label[$valueKey] " . "ValorMaisBonus: $value + $bonus " . "Combinações: $combination"];
                                    } else {
                                        $totalPrice += $value;
                                        if ($matingale == true && $value > $resultMatingale->max_valor && $resultMatingale->max_valor > 50) {
                                            $status = ["error" => true, "message" => "Máximo de 2 aumentos para apostas acima de R$ 50,00 ($number). Realize uma aposta igual ou menor que " . money_format('%.2n', $resultMatingale->max_valor) . "."];
                                        }
                                        if ($type == "G") {
                                            if (($resultSUM->total + $value) > $result1->aceite_limite) {
                                                $status = ["error" => true, "message" => "Limite máximo atingido para esta aposta ($number) na loteria $result2->descricao."];
                                            }
                                        } else if ($type == "U") {
                                            if ($label[$valueKey] == '1 ao 5') {
                                                if (($resultSUM->total + ($value / 5)) > $result1->aceite_limite) {
                                                    $status = ["error" => true, "message" => "Limite máximo atingido para esta aposta ($number) na loteria $result2->descricao. "];
                                                }
                                            } else {
                                                if (($resultSUM->total + $value) > $result1->aceite_limite) {
                                                    $status = ["error" => true, "message" => "Limite máximo atingido para esta aposta ($number) na loteria $result2->descricao."];
                                                }
                                            }
                                        }
                                        $bonus = ($value * ($result1->bonus / 100));
                                        $prizeInfo = getPrizeValue($postData["game"], $result1->cotacao, $label[$valueKey], ($value + $bonus), $combination);
                                        $games[] = [$number, $value, $lottery, date("Y-m-d"), $label[$valueKey], ($value * ($result1->bonus / 100)), $result1->modalidade_id, ($value + $bonus), $getCookie->sub, $prizeInfo[1], date("Y-m-d H:i:s"), date("Y-m-d H:i:s"), $combination, $prizeInfo[0], "Jogo: " . $postData["game"] . " Cotação: $result1->cotacao " . "Colocação: $label[$valueKey] " . "ValorMaisBonus: $value + $bonus " . "Combinações: $combination"];
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if ($revert == true) {
                $postData["game"] = "PVV";
            }
        }
    }

    $totalPriceAll *= count($arrayLottery);
    $totalPrice += $totalPriceAll;
    if ($totalMoney >= $totalPrice) {
        $remainder = $totalMoney - $totalPrice;
        if ($money >= $totalPrice) {
            $moneyLeft[0] = $money - $totalPrice;
        } else if ($jackpot >= $remainder) {
            $moneyLeft[0] = 0;
            $moneyLeft[1] = $remainder;
        }
    } else {
        $status = ["error" => true, "message" => "Créditos insuficientes!"];
    }
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->beginTransaction();
    try {
        if (!$status["error"]) {
            // $stmt3 = $db->prepare("UPDATE users SET debit_base = ?, debit_premio = ? WHERE user_id = ?");
            $stmt3 = $db->prepare("UPDATE `users` SET debit_premio = if(debit_base < $totalPrice, debit_premio - ($totalPrice - debit_base), debit_premio), 
            debit_base = if(debit_base >= $totalPrice, debit_base - $totalPrice,0) WHERE user_id = ?");
            $stmt3->execute([$getCookie->sub]);
            foreach ($games as $values) {
                $totalMoney -= $values[1];
                $stmt4 = $db->prepare("INSERT INTO jogos (numeros, valor, loteria, data, colocacao_label, bonus, modalidade_id, valor_bonus, usuario_id, cotacao, created_at, updated_at, combinacoes, premio_possivel, colocacao) 
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
                $stmt4->execute($values);
                $stmt5 = $db->prepare("INSERT INTO transactions (jogo, saldo, time, type, amount, status, sender, receiver, ip_address) 
                    VALUES (LAST_INSERT_ID(),?,?,?,?,?,?,'BPremiado',?)");
                $stmt5->execute([$totalMoney, date("Y-m-d H:i:s"), 100, $values[1], 2, $getCookie->nam, $_SERVER['REMOTE_ADDR']]);
            }
        }
        $db->commit();
        return json_encode([$status,"total" => $totalPrice,"loteria" => $envLottery]);
    } catch (PDOException $e) {
        $db->rollBack();
        $data_hora = date('Y-m-d H:i:s');
        $log_ip = getenv("REMOTE_ADDR");
        $username = $getCookie->nam;
        $user_id = $getCookie->sub;
        $updateInativa = $db->prepare("UPDATE users set status = 0, motivo = 'Tentativa de burlar o sistema.' where user_id = ?");
        $updateInativa->execute([$user_id]);
        $log = $db->prepare("INSERT INTO log (username, descricao, data, ip) VALUES (?, 'Tentou burlar o sistema', '$data_hora' , '$log_ip' )");
        $log->execute([$username]);
        $token = array(
            "sts" => 0,
            "exp" => time() + 1800,
        );
        $jwt = JWT::encode($token, "6d65f7c9864bcd2a6e3932250ea515bc");
        setcookie("token", $jwt, time() + 1800, '/');
    }
}


function gameMultiple($db, $getCookie, $postData, $label, $type)
{
    $arrayLottery = $postData['lottery'];
    $status = ["error" => false];
    $arrayNumbers = explode(",", $postData["numbers"]);
    $games = [];
    $totalPrice = 0;
    $totalPriceAll = 0;
    $dividedValue = 0;
    $prizeInfo = [];
    $bonus = 0;
    $allgames = [];
    

    $statesModality = array(
        'M'  => ['1ºP', '1 ao 5', '1 ao 6', '', '2ºP', '3ºP', '4ºP', '5ºP'],
        'DZ' => ['1ºP', '1 ao 5', '1 ao 6', '1 ao 7', '2ºP', '3ºP', '4ºP', '5ºP'],
        'C'  => ['1ºP', '1 ao 5', '1 ao 6', '1 ao 7', '2ºP', '3ºP', '4ºP', '5ºP'],
    );

    $allgames[] = $postData["game"];
    if ($postData["allgames"]) {
        foreach ($postData["allgames"] as $game) {
            $allgames[] = $game;
        }
    }
    $numbersGlobal = $postData["numbers"];

    if (empty($postData['value'])) {
        $status = ["error" => true, "message" => "Insira uma quantia para o jogo!"];
    }
    if (empty($postData["numbers"])) {
        $status = ["error" => true, "message" => "Por favor, revise sua aposta!"];
    }

    $stmt = $db->prepare("SELECT * FROM users WHERE user_id = ?");
    $stmt->execute([$getCookie->sub]);
    $result = $stmt->fetch(PDO::FETCH_OBJ);

    $money = $result->debit_base;
    $jackpot = $result->debit_premio;
    $totalMoney = $money + $jackpot;
    $moneyLeft = [$money, $jackpot];

    if ($result->status == 0) {
        $token = array(
            "sts" => 0,
            "exp" => time() + 1800,
        );
        $jwt = JWT::encode($token, "6d65f7c9864bcd2a6e3932250ea515bc");
        setcookie("token", $jwt, time() + 1800, '/');
    }

    $stmt_cotadas = $db->query("SELECT * FROM apostas_cotadas");
    $apostas_cotadas = $stmt_cotadas->fetchAll(PDO::FETCH_COLUMN);

    foreach ($allgames as $allgame) {
        
        $label = $statesModality[$allgame];

        if (!$status["error"]) {


            if ($allgame == 'M') {
                $newnumber = [];
                $y = 0;
                while ($y < count($numbersGlobal)) {
                    array_push($newnumber, $numbersGlobal[$y]);
                    $y++;
                }
            }
            if ($allgame == 'DZ') {
                $newnumber = [];
                $y = 0;
                while ($y < count($numbersGlobal)) {
                    array_push($newnumber, substr($numbersGlobal[$y], -2));
                    $y++;
                }
            }

            if ($allgame == 'C') {
                $newnumber = [];
                $x = 0;
                while ($x < count($numbersGlobal)) {
                    array_push($newnumber, substr($numbersGlobal[$x], -3));
                    $x++;
                }
            }

            $newnumber = array_unique($newnumber);
            foreach ($newnumber as $numberKey => $number) {
                $combination = getCombinations($allgame, $number);

                $revert = false;
                if ($allgame == "PVV") {
                    $arrayPVV = explode(",", $number);
                    if ($arrayPVV[0] == $arrayPVV[1]) {
                        $revert = true;
                        $allgame = "PAS";
                    }
                }

                if (array_search($number, $apostas_cotadas, true) !== false) {
                    $status = ["error" => true, "message" => "Número ($number) pertencente à apostas cotadas, aposta inválida "];
                }

                if (!$status["error"]) {
                    $stmt1 = $db->prepare("SELECT * FROM cotacoes WHERE sigla = ?");
                    $stmt1->execute([$allgame]);
                    $result1 = $stmt1->fetch(PDO::FETCH_OBJ);
                }

                if ($type == "G") {
                    $arrayNumbers = explode(",", $number);
                } else if ($type == "U") {
                    $arrayNumbers = str_split($number);
                }
              
                if (!$status["error"]) {
                    
                    foreach ($postData['value'] as $valueKey => $value) {
                        if ($value != null) {
                            if ($postData['valueOptions'][$valueKey] == "all") {
                                $dividedValue = floor(($value / count($postData["numbers"])) * 100) / 100;
                                $status = checkInvalidGame($status, $result1, $dividedValue, $arrayNumbers, $arrayLottery, $$label[$valueKey], $type);
                                $totalPriceAll += $dividedValue;
                            } else {
                        
                                $status = checkInvalidGame($status, $result1, $value, $arrayNumbers, $arrayLottery, $label[$valueKey], $type);
                            }

                            if (!$status["error"]) {
                                $envLottery = [];
                                foreach ($arrayLottery as $lottery) {
                                    $stmt2 = $db->prepare("SELECT horario_limite AS max_time, descricao FROM loterias WHERE loteria_id = ?");
                                    $stmt2->execute([$lottery]);
                                    $result2 = $stmt2->fetch(PDO::FETCH_OBJ);
                                    $envLottery[] = $result2->descricao;

                                    if (date('H:i') > $result2->max_time) {
                                        $status = ["error" => true, "message" => "Loteria $result2->descricao indisponivel."];
                                    }

                                    $stmtSUM = $db->prepare("SELECT SUM(IF(modalidade_id IN(15,16,13,14,22,23,19,26,17,27,18,28,11,25,12,24), valor, IF(colocacao_label = '1 ao 5', valor / 5, valor))) AS total
                                        FROM `jogos` WHERE situacao = 1 AND numeros = ? AND loteria = ? AND conferido = 0");
                                    $stmtSUM->execute([$number, $lottery]);
                                    $resultSUM = $stmtSUM->fetch(PDO::FETCH_OBJ);

                                    $stmtAceite = $db->prepare("SELECT aceite_1ao5,aceite_1ao7 FROM cotacoes WHERE sigla = ?");
                                    $stmtAceite->execute([$allgame]);
                                    $resultAceite = $stmtAceite->fetch(PDO::FETCH_OBJ);

                                    if ($allgame == "G") {
                                        if ($label[$valueKey] == "1 ao 5" && $value > $resultAceite->aceite_1ao5) {
                                            $status = ["error" => true, "message" => "Máximo de R$ $resultAceite->aceite_1ao5 para esta modalidade de 1.º ao 5.º prêmio"];
                                        }

                                        if ($label[$valueKey] == "1 ao 7" && $value > $resultAceite->aceite_1ao7) {
                                            $status = ["error" => true, "message" => "Máximo de R$ $resultAceite->aceite_1ao7 para esta modalidade de 1.º ao 7.º prêmio"];
                                        }
                                        $stmtGameLimit = $db->prepare("SELECT numeros FROM `jogos` a 
                                            WHERE a.situacao = 1 AND numeros = ? AND modalidade_id = 1 AND usuario_id = ? AND loteria = ? AND conferido = 0 AND colocacao_label = ? LIMIT 1");
                                        $stmtGameLimit->execute([$number, $getCookie->sub, $lottery, $label[$valueKey]]);
                                        $resultGameLimit = $stmtGameLimit->fetchAll(PDO::FETCH_COLUMN);
                                        if (count($resultGameLimit) > 0) {
                                            $status = ["error" => true, "message" => "Aposta duplicada ($number), realize uma aposta nova ou estorne a anterior."];
                                        }

                                        $stmtMatingale = $db->prepare("SELECT count(*) AS qtd, IFNULL(MAX(a.valor), 0) AS max_valor FROM `jogos` a WHERE a.situacao = 1 AND numeros = ? AND modalidade_id = 1 AND usuario_id = ? AND valor > 50
                                            AND a.data > IFNULL((SELECT max(data) FROM `sorteios` a LEFT JOIN loterias b ON a.loteria_id = b.loteria_id WHERE a.grupo1 = ? AND b.grupo = (SELECT c.grupo FROM loterias c WHERE c.loteria_id = ?)), DATE_SUB(NOW(), INTERVAL 30 DAY))");
                                        $stmtMatingale->execute([$number, $getCookie->sub, $number, $lottery]);
                                        $resultMatingale = $stmtMatingale->fetch(PDO::FETCH_OBJ);
                                        if ($resultMatingale->qtd >= 3) {
                                            $matingale = true;
                                        }
                                    }

                                    if (!$status["error"]) {
                                        setlocale(LC_MONETARY, "pt_BR", "ptb");
                                        if ($postData['valueOptions'][$valueKey] == "all") {
                                            if ($matingale == true && $dividedValue > $resultMatingale->max_valor && $resultMatingale->max_valor > 50) {
                                                $status = ["error" => true, "message" => "Máximo de 2 aumentos para apostas acima de R$ 50,00 ($number). Realize uma aposta igual ou menor que " . money_format('%.2n', $resultMatingale->max_valor) . "."];
                                            }
                                            if ($type == "G") {
                                                if (($resultSUM->total + $dividedValue) > $result1->aceite_limite) {
                                                    $status = ["error" => true, "message" => "Limite máximo atingido para esta aposta ($number) na loteria $result2->descricao."];
                                                }
                                            } else if ($type == "U") {
                                                if ($label[$valueKey] == '1 ao 5') {
                                                    if (($resultSUM->total + ($dividedValue / 5)) > $result1->aceite_limite) {
                                                        $status = ["error" => true, "message" => "Limite máximo atingido para esta aposta ($number) na loteria $result2->descricao."];
                                                    }
                                                } else {
                                                    if (($resultSUM->total + $dividedValue) > $result1->aceite_limite) {
                                                        $status = ["error" => true, "message" => "Limite máximo atingido para esta aposta ($number) na loteria $result2->descricao." . $dividedValue / 5];
                                                    }
                                                }
                                            }
                                            $bonus = ($dividedValue * ($result1->bonus / 100));
                                            $prizeInfo = getPrizeValue($allgame, $result1->cotacao, $label[$valueKey], $dividedValue + $bonus, $combination);
                                            $games[] = [$number, $dividedValue, $lottery, date("Y-m-d"), $label[$valueKey], $bonus, $result1->modalidade_id, $bonus + $dividedValue, $getCookie->sub, $prizeInfo[1], date("Y-m-d H:i:s"), date("Y-m-d H:i:s"), $combination, $prizeInfo[0], "Jogo: " . $allgame . " Cotação: $result1->cotacao " . "Colocação: $label[$valueKey] " . "ValorMaisBonus: $value + $bonus " . "Combinações: $combination"];
                                        } else {
                                            $totalPrice += $value;
                                            if ($matingale == true && $value > $resultMatingale->max_valor && $resultMatingale->max_valor > 50) {
                                                $status = ["error" => true, "message" => "Máximo de 2 aumentos para apostas acima de R$ 50,00 ($number). Realize uma aposta igual ou menor que " . money_format('%.2n', $resultMatingale->max_valor) . "."];
                                            }
                                            if ($type == "G") {
                                                if (($resultSUM->total + $value) > $result1->aceite_limite) {
                                                    $status = ["error" => true, "message" => "Limite máximo atingido para esta aposta ($number) na loteria $result2->descricao."];
                                                }
                                            } else if ($type == "U") {
                                                if ($label[$valueKey] == '1 ao 5') {
                                                    if (($resultSUM->total + ($value / 5)) > $result1->aceite_limite) {
                                                        $status = ["error" => true, "message" => "Limite máximo atingido para esta aposta ($number) na loteria $result2->descricao. "];
                                                    }
                                                } else {
                                                    if (($resultSUM->total + $value) > $result1->aceite_limite) {
                                                        $status = ["error" => true, "message" => "Limite máximo atingido para esta aposta ($number) na loteria $result2->descricao."];
                                                    }
                                                }
                                            }
                                            $bonus = ($value * ($result1->bonus / 100));
                                            $prizeInfo = getPrizeValue($allgame, $result1->cotacao, $label[$valueKey], ($value + $bonus), $combination);
                                            
                                            $games[] = [$number, $value, $lottery, date("Y-m-d"), $label[$valueKey], ($value * ($result1->bonus / 100)), $result1->modalidade_id, ($value + $bonus), $getCookie->sub, $prizeInfo[1], date("Y-m-d H:i:s"), date("Y-m-d H:i:s"), $combination, $prizeInfo[0], "Jogo: " . $allgame . " Cotação: $result1->cotacao " . "Colocação: $label[$valueKey] " . "ValorMaisBonus: $value + $bonus " . "Combinações: $combination"];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if ($revert == true) {
                    $allgame = "PVV";
                }
            }
        }
    }

    $totalPriceAll *= count($arrayLottery);
    $totalPrice += $totalPriceAll;
    if ($totalMoney >= $totalPrice) {
        $remainder = $totalMoney - $totalPrice;
        if ($money >= $totalPrice) {
            $moneyLeft[0] = $money - $totalPrice;
        } else if ($jackpot >= $remainder) {
            $moneyLeft[0] = 0;
            $moneyLeft[1] = $remainder;
        }
    } else {
        $status = ["error" => true, "message" => "Créditos insuficientes!"];
    }

    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->beginTransaction();

    try {
        if (!$status["error"]) {
            // $stmt3 = $db->prepare("UPDATE users SET debit_base = ?, debit_premio = ? WHERE user_id = ?");
            $stmt3 = $db->prepare("UPDATE `users` SET debit_premio = if(debit_base < $totalPrice, debit_premio - ($totalPrice - debit_base), debit_premio), 
                debit_base = if(debit_base >= $totalPrice, debit_base - $totalPrice,0) WHERE user_id = ?");
            $stmt3->execute([$getCookie->sub]);
            foreach ($games as $values) {
                $totalMoney -= $values[1];
                $stmt4 = $db->prepare("INSERT INTO jogos (numeros, valor, loteria, data, colocacao_label, bonus, modalidade_id, valor_bonus, usuario_id, cotacao, created_at, updated_at, combinacoes, premio_possivel, colocacao) 
                        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
                $stmt4->execute($values);
                $stmt5 = $db->prepare("INSERT INTO transactions (jogo, saldo, time, type, amount, status, sender, receiver, ip_address) 
                        VALUES (LAST_INSERT_ID(),?,?,?,?,?,?,'BPremiado',?)");
                $stmt5->execute([$totalMoney, date("Y-m-d H:i:s"), 100, $values[1], 2, $getCookie->nam, $_SERVER['REMOTE_ADDR']]);
            }
        }
        $db->commit();
    } catch (PDOException $e) {
        $db->rollBack();
        $data_hora = date('Y-m-d H:i:s');
        $log_ip = getenv("REMOTE_ADDR");
        $username = $getCookie->nam;
        $user_id = $getCookie->sub;
        $updateInativa = $db->prepare("UPDATE users set status = 0, motivo = 'Tentativa de burlar o sistema.' where user_id = ?");
        $updateInativa->execute([$user_id]);
        $log = $db->prepare("INSERT INTO log (username, descricao, data, ip) VALUES (?, 'Tentou burlar o sistema', '$data_hora' , '$log_ip' )");
        $log->execute([$username]);
        $token = array(
            "sts" => 0,
            "exp" => time() + 1800,
        );
        $jwt = JWT::encode($token, "6d65f7c9864bcd2a6e3932250ea515bc");
        setcookie("token", $jwt, time() + 1800, '/');
    }

    return json_encode([$status,"total" => $totalPrice,"loteria" => $envLottery]);
}


$app->group('/play', function () use ($app, $checkSession) {

    $app->group('', function () use ($app) {
        $app->get('/information', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            // $stmt = $this->db->prepare("SELECT jogo_id AS id, b.sigla AS game, c.descricao AS lottery, numeros AS numbers,
            // valor_bonus AS value, colocacao_label AS label FROM jogos AS a
            // LEFT JOIN cotacoes AS b ON a.modalidade_id = b.modalidade_id 
            // LEFT JOIN loterias AS c ON a.loteria = c.loteria_id
            // LEFT JOIN loterias d ON loteria = d.loteria_id
            // WHERE conferido = 0 AND usuario_id = ? AND a.situacao = 1 AND (? < d.horario_limite) ORDER BY jogo_id DESC");
            // $stmt->execute([$getCookie->sub, date('H:i')]);
            // $result[] = $stmt->fetchAll();

            $stmt = $this->db->prepare("SELECT (debit_base + debit_premio) AS money FROM users WHERE user_id = ?");
            $stmt->execute([$getCookie->sub]);
            $result[] = number_format($stmt->fetch()['money'], 2, ',', '.');

            $stmt = $this->db->prepare("SELECT max(data) as info_dtlast_game_ajax, count(jogo_id) as info_qtd_jogo_ajax FROM `jogos` where usuario_id = ?");
            $stmt->execute([$getCookie->sub]);
            $result[] = (object) $stmt->fetch();

            $response->getBody()->write(json_encode([
                'info_money_ajax' => $result[0], 'info_games_ajax' => $result[1],
                'info_permissao_ajax' => $getCookie->per, 'info_name_ajax' => $getCookie->nam, 'info_user_id_ajax' => $getCookie->sub, 'info_profile_ajax' => $getCookie->prf
            ]));
            return $response;
        });

        $app->get('/reverse/{id}', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $stmt = $this->db->prepare("UPDATE jogos a
            INNER JOIN users b ON a.usuario_id = b.user_id
            INNER JOIN transactions c ON a.jogo_id = c.jogo
            INNER JOIN loterias d ON loteria = d.loteria_id
            SET a.situacao = 0, b.debit_base = (b.debit_base + c.amount)
            WHERE a.jogo_id = ? AND a.usuario_id = ? AND a.conferido = 0 AND (? < d.horario_limite) AND a.situacao = 1");
            $stmt->execute([$args["id"], $getCookie->sub, date('H:i')]);
            if ($stmt->rowCount() > 0) {
                $this->db->prepare("INSERT INTO transactions (jogo, saldo, time, type, amount, status,receiver,sender, ip_address)
                SELECT ? AS jogo, (debit_base + debit_premio) AS saldo, ? AS time, '101' AS type, c.amount, 2 AS status,
                'BPremiado' AS receiver, ? as sender, ? as ip_address FROM jogos a
                INNER JOIN users b ON a.usuario_id = b.user_id
                INNER JOIN transactions c ON a.jogo_id = c.jogo
                WHERE jogo_id = ?")->execute([$args["id"], date("Y-m-d H:i:s"), $getCookie->nam, $_SERVER['REMOTE_ADDR'], $args["id"]]);

                $response->getBody()->write(json_encode(["error" => false]));
            } else {
                $response->getBody()->write(json_encode(["error" => true, "message" => "Jogo indisponivel para estorno!"]));
            }
            return $response;
        });

        $app->get('/modalidadejogo/{game}', function (Request $request, Response $response, array $args) {
            $stmt = $this->db->prepare("SELECT a.sigla as sigla_ajax, a.loteria_id as loteria_identificacao_ajax, a.descricao as descricao_ajax, b.descricao AS g_desc_ajax,b.ordem_game as classifica_ajax FROM loterias a
            LEFT JOIN grupos_sorteios b ON grupo = grupo_id WHERE (? < horario_limite) AND situacao <> 0 
            AND IF((DAYOFWEEK(?) = 1 AND dom = 'S') OR (DAYOFWEEK(?) = 2 AND seg = 'S') OR (DAYOFWEEK(?) = 3 AND ter = 'S') OR
            (DAYOFWEEK(?) = 4 AND qua = 'S') OR (DAYOFWEEK(?) = 5 AND qui = 'S') OR (DAYOFWEEK(?) = 6 AND sex = 'S') OR
            (DAYOFWEEK(?) = 7 AND sab = 'S'), 1, 0) = 1 AND loteria_id <> 12 ORDER BY classifica_ajax,horario_limite");
            if (strtotime(date('H:i')) > strtotime('21:50')) {
                $time = date('H:i', strtotime('00:00'));
                $date = new DateTime('tomorrow');
                $date = $date->format('Y-m-d');
            } else {
                $time = date('H:i');
                $date = date('Y-m-d');
            }
            $stmt->execute([$time, $date, $date, $date, $date, $date, $date, $date]);
            $stmt2 = $this->db->prepare("SELECT * FROM cotacoes WHERE sigla = ?");
            $stmt2->execute([$args['game']]);
            $result[] = $stmt->fetchAll(PDO::FETCH_OBJ);
            // $result[] = $stmt2->fetch(PDO::FETCH_OBJ);
            $response->getBody()->write(json_encode($result));
            return $response;
        });

        $app->post('/G', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1ºP', '1 ao 5', '1 ao 6', '1 ao 7', '2ºP', '3ºP', '4ºP', '5ºP'], "G"));
            return $response;
        });

        $app->post('/PAS', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $postData['game'] = $postData["pvv"] == 1 ? "PVV" : "PAS";
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1 ao 5'], "G"));
            return $response;
        });

        $app->post('/DG', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1 ao 5', '1 ao 2', '2,3', '3,4', '4,5' ], "G"));
            return $response;
        });

        $app->post('/TG', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1 ao 5', '1 ao 3', '2,3,4', '3,4,5'], "G"));
            return $response;
        });

        $app->post('/QG', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1 ao 4', '1 ao 5'], "G"));
            return $response;
        });

        $app->post('/QG5', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1 ao 5'], "G"));
            return $response;
        });

        $app->post('/U', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData,  ['1ºP', '1 ao 5', '1 ao 6', '1 ao 7', '2ºP', '3ºP', '4ºP', '5ºP'], "U"));
            return $response;
        });

        $app->post('/DZ', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1ºP', '1 ao 5', '1 ao 6', '1 ao 7', '2ºP', '3ºP', '4ºP', '5ºP'], "U"));
            return $response;
        });

        $app->post('/C', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(gameMultiple($this->db, $getCookie, $postData,  '', "U"));
            return $response;
        });

        $app->post('/M', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(gameMultiple($this->db, $getCookie, $postData, '', "U"));
        });

        $app->post('/MC', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1ºP', '1 ao 5'], "U"));
            return $response;
        });

        $app->post('/DDZ', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1 ao 5'], "G"));
            return $response;
        });

        $app->post('/TDZ', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1 ao 5'], "G"));
            return $response;
        });

        $app->post('/CC', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1ºP', '1 ao 5'], "U"));
            return $response;
        });

        $app->post('/DZC', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1ºP', '1 ao 5'], "U"));
            return $response;
        });

        $app->post('/MM', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1ºP', '1 ao 5'], "U"));
            return $response;
        });

        $app->post('/MCC', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1ºP', '1 ao 5'], "U"));
            return $response;
        });

        $app->post('/DDZC', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1 ao 5'], "G"));
            return $response;
        });

        $app->post('/TDZC', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1 ao 5'], "G"));
            return $response;
        });

        $app->post('/TGC', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1 ao 3', '1 ao 5'], "G"));
            return $response;
        });

        $app->post('/QGC', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1 ao 4', '1 ao 5'], "G"));
            return $response;
        });

        $app->post('/QG5C', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1 ao 5'], "G"));
            return $response;
        });

        $app->post('/PASC', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $postData['game'] = $postData["pvv"] == 1 ? "PVVC" : "PASC";
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1 ao 5'], "G"));
            return $response;
        });

        $app->post('/DGC', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $postData = $request->getParsedBody();
            $response->getBody()->write(game($this->db, $getCookie, $postData, ['1 ao 2', '1 ao 5'], "G"));
            return $response;
        });
    })->add($checkSession);

    ////////////// ROTA PARA BUSCAR APOSTAS COTADAS ///////
    $app->post('/cotadas', function (Request $request, Response $response, array $args) {
        $stmt = $this->db->query("SELECT * FROM apostas_cotadas ORDER BY `valor`");
        $result = $stmt->fetchAll();

        $response->getBody()->write(json_encode($result));
        return $response;
    });
    //////////////////////////////////////////////////////////

    $app->get('/modalidades_cotacao', function (Request $request, Response $response, array $args) {
        $stmt = $this->db->query("SELECT a.descricao as descricao_ajax, a.cotacao as cotacao_ajax, a.bonus as bonus_ajax FROM cotacoes a where a.cotacao_id  not in (3,4,5,7,9,14,16,18,23,24,25,26,27,28) ORDER BY `ordem` ASC ");
        $result = $stmt->fetchAll();
        foreach ($result as $key => $value) {
            $result[$key]['cotacao_ajax'] = number_format($result[$key]['cotacao_ajax'], 2, ',', '.');
            $result[$key]['bonus_ajax'] = str_replace(".00", " % ", $result[$key]['bonus_ajax']);
        }
        $response->getBody()->write(json_encode($result));
        return $response;
    });

    $app->get('/winning', function (Request $request, Response $response, array $args) {

        $getCookie = GetToken::tokenArray($request);

        if (intval($getCookie->prm) >= 1) {
            $token = array(
                "sub" => $getCookie->sub,
                "nam" => $getCookie->nam,
                "per" => $getCookie->per,
                "tma" => $getCookie->tma,
                "sts" => $getCookie->sts,
                "exp" => $getCookie->exp,
                "prm" => '0',
                "prf" => $getCookie->prf,
            );
            $jwt = JWT::encode($token, "6d65f7c9864bcd2a6e3932250ea515bc");
            setcookie("token", $jwt, time() + 1800, '/');
        }

        $result["premio"] = $getCookie->prm;
        $result["user_name"] = $getCookie->nam;
        $response->getBody()->write(json_encode($result));
        return $response;
    });
});

$app->group('/lotteries', function () use ($app, $checkSession) {
    $app->group('', function () use ($app) {
        $app->get('/', function (Request $request, Response $response, array $args) {
            $stmt = $this->db->query("SELECT a.grupo_id, b.descricao FROM `grupos_sorteios` a LEFT JOIN `loterias` b ON b.grupo = a.grupo_id WHERE b.situacao = 1 GROUP BY a.grupo_id order by a.grupo_id
            ");
            $result = $stmt->fetchAll();
            $response->getBody()->write(json_encode($result));
            return $response;
        });
        $app->get('/runninglotteries', function (Request $request, Response $response, array $args) {
            $diaLoteria = date('D');
            $semana = array(
                'Sun' => 'dom',
                'Mon' => 'seg',
                'Tue' => 'ter',
                'Wed' => 'qua',
                'Thu' => 'qui',
                'Fri' => 'sex',
                'Sat' => 'sab'
            );
            $day = $semana["$diaLoteria"];
            $stmt = $this->db->query("SELECT descricao FROM `loterias` where cast(horario_limite as time)>now() and situacao=1 and  $day = 'S'  order by horario_limite");
            $result = $stmt->fetchAll();
            $response->getBody()->write(json_encode($result));
            return $response;
        });
    })->add($checkSession);
});
