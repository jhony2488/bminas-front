<?php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Firebase\JWT\JWT;

$app->group('/results', function () use ($app) {

    // $app->get('/sorteio', function (Request $request, Response $response, array $args) {
    //     $data = date('Y-m-d');
    //     $stmt = $this->db->prepare("SELECT * FROM `sorteios` a left join loterias b on a.loteria_id = b.loteria_id where status_sorteio_id = 4 and data = ? ORDER BY b.descricao DESC");
    //     $stmt->execute([$data]);
    //     $result = $stmt->fetchAll();
    //     foreach ($result as $key => $value) {
    //         $result[$key]['grupo1'] = str_pad($result[$key]['grupo1'], 2, '0', STR_PAD_LEFT);
    //         $result[$key]['grupo2'] = str_pad($result[$key]['grupo2'], 2, '0', STR_PAD_LEFT);
    //         $result[$key]['grupo3'] = str_pad($result[$key]['grupo3'], 2, '0', STR_PAD_LEFT);
    //         $result[$key]['grupo4'] = str_pad($result[$key]['grupo4'], 2, '0', STR_PAD_LEFT);
    //         $result[$key]['grupo5'] = str_pad($result[$key]['grupo5'], 2, '0', STR_PAD_LEFT);
    //         $result[$key]['grupo6'] = str_pad($result[$key]['grupo6'], 2, '0', STR_PAD_LEFT);
    //         $result[$key]['grupo7'] = str_pad($result[$key]['grupo7'], 2, '0', STR_PAD_LEFT);
    //     }
    //     $response->getBody()->write(json_encode($result));
    //     return $response;
    // });
 
    // //Mostra jogos feitos naquele dia
    // $app->get('/', function (Request $request, Response $response, array $args) {
    //     $getCookie = GetToken::tokenArray($request)->sub;
    //     $postData['user_id'] = $getCookie;
    //     $postData['data'] = date('Y-m-d');
    //     $stmt = $this->db->prepare("SELECT jogo_id , b.descricao, numeros , valor_bonus,loteria,premiado FROM jogos AS a LEFT JOIN cotacoes AS b ON a.modalidade_id = b.modalidade_id LEFT JOIN loterias AS c ON a.loteria = c.loteria_id WHERE conferido = 1 and usuario_id = ? and data = ?  ORDER BY jogo_id DESC");
    //     $stmt->execute(array_values($postData));
    //     $result = $stmt->fetchAll();
    //     $response->getBody()->write(json_encode($result));
    // });

    //Mostra modal
    $app->get('/{id:[0-9]+}', function (Request $request, Response $response, array $args) {
        $id = $args['id'];
        $getCookie = GetToken::tokenArray($request)->sub;
        $postData['usuario'] = $getCookie;
        $stmt = $this->db->prepare("SELECT *,c.descricao as descloteria,b.created_at as datajogo FROM `jogos` b left join loterias c on b.loteria = c.loteria_id left join cotacoes d on d.modalidade_id = b.modalidade_id where b.usuario_id = ? and b.jogo_id = ?");
        $stmt->execute([$postData['usuario'], $id]);
        $result = $stmt->fetchAll();
        $response->getBody()->write(json_encode($result));
    });

    //Resultados antigos
    $app->get('/sorteio[/{prev}[/{filter}]]', function (Request $request, Response $response, array $args) {
        if ($args['prev'] == "true") {
            $date = date('Y-m-d', strtotime(date('Y-m-d') . "-1 days"));
        } else {
            $date = date('Y-m-d');
        }
        $getCookie2 = GetToken::tokenArray($request)->sub;
        $postData2['user_id'] = $getCookie2;
        $postData2['date'] = $date;
        if($args['filter'] != 'todos'){
            $stmt = $this->db->prepare("SELECT * FROM `sorteios` a left join loterias b on a.loteria_id = b.loteria_id where status_sorteio_id = 4 and cast(data as date) = ? and b.grupo = ? ORDER BY b.ordem");
            $stmt->execute([$date,$args['filter']]);
        }else{
            $stmt = $this->db->prepare("SELECT * FROM `sorteios` a left join loterias b on a.loteria_id = b.loteria_id where status_sorteio_id = 4 and cast(data as date) = ? ORDER BY b.ordem");
            $stmt->execute([$date]);
        }
        $result = $stmt->fetchAll();
        foreach ($result as $key => $value) {
            $result[$key]['grupo1'] = str_pad($result[$key]['grupo1'], 2, '0', STR_PAD_LEFT);
            $result[$key]['grupo2'] = str_pad($result[$key]['grupo2'], 2, '0', STR_PAD_LEFT);
            $result[$key]['grupo3'] = str_pad($result[$key]['grupo3'], 2, '0', STR_PAD_LEFT);
            $result[$key]['grupo4'] = str_pad($result[$key]['grupo4'], 2, '0', STR_PAD_LEFT);
            $result[$key]['grupo5'] = str_pad($result[$key]['grupo5'], 2, '0', STR_PAD_LEFT);
            $result[$key]['grupo6'] = str_pad($result[$key]['grupo6'], 2, '0', STR_PAD_LEFT);
            $result[$key]['grupo7'] = str_pad($result[$key]['grupo7'], 2, '0', STR_PAD_LEFT);
        }
    //Mostra jogos feitos naquele dia
        $stmt2 = $this->db->prepare("SELECT jogo_id , b.descricao, numeros , valor_bonus,loteria,premiado,b.sigla,colocacao_label, SUM(d.amount) AS premio FROM jogos AS a 
        LEFT JOIN cotacoes AS b ON a.modalidade_id = b.modalidade_id 
        LEFT JOIN loterias AS c ON a.loteria = c.loteria_id 
        LEFT JOIN transactions AS d on a.jogo_id = d.jogo and d.type = 102 and d.status = 2
        WHERE conferido = 1 and a.situacao = 1 and usuario_id = ? and cast(data as date) = ? GROUP BY 1,2,3,4,5,6,7,8 ORDER BY jogo_id DESC");
        $stmt2->execute(array_values($postData2));
        $result2 = $stmt2->fetchAll();
        $response->getBody()->write(json_encode([$result,$result2, implode("/", array_reverse(explode("-",$date)))]));
        return $response;
    });

})->add($checkSession);
