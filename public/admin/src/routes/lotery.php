<?php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Firebase\JWT\JWT;

$app->group('/lot', function () use ($app, $verifica) {
    $app->get('/now[/{prev}]', function (Request $request, Response $response, array $args) {
        $stmt = $this->db->prepare("SELECT a.bicho1 as animal_1_ajax, a.bicho2 as animal_2_ajax, a.bicho3 as animal_3_ajax, a.bicho4 as animal_4_ajax, a.bicho5 as animal_5_ajax, a.bicho6 as animal_6_ajax, a.bicho7 as animal_7_ajax, a.grupo1 as grupo_1_ajax, a.grupo2 as grupo_2_ajax, a.grupo3 as grupo_3_ajax, a.grupo4 as grupo_4_ajax, a.grupo5 as grupo_5_ajax, a.grupo6 as grupo_6_ajax, a.grupo7 as grupo_7_ajax, a.primeiro_premio as prize_1_ajax, a.segundo_premio as prize_2_ajax, a.terceiro_premio as prize_3_ajax, a.quarto_premio as prize_4_ajax, a.quinto_premio as prize_5_ajax, a.sexto_premio as prize_6_ajax, a.setimo_premio as prize_7_ajax, b.grupo as grupo_ajax, b.descricao as descricao_ajax, c.descricao AS loteria_name_ajax FROM sorteios AS a LEFT JOIN loterias AS b ON a.loteria_id = b.loteria_id LEFT JOIN grupos_sorteios as c ON b.grupo = grupo_id WHERE status_sorteio_id = 4 and cast(data as date) = ? AND situacao <> 3 order by ordem");
        if ($args['prev'] == "ontem") {
            $date = date('Y-m-d', strtotime(date('Y-m-d') . "-1 days"));
        } else {
            $date = date('Y-m-d');
        }
        $stmt->execute([$date]);
        $result = $stmt->fetchAll();
        foreach ($result as $key => $value) {
            $result[$key]['grupo_1_ajax'] = str_pad($result[$key]['grupo_1_ajax'], 2, '0', STR_PAD_LEFT);
            $result[$key]['grupo_2_ajax'] = str_pad($result[$key]['grupo_2_ajax'], 2, '0', STR_PAD_LEFT);
            $result[$key]['grupo_3_ajax'] = str_pad($result[$key]['grupo_3_ajax'], 2, '0', STR_PAD_LEFT);
            $result[$key]['grupo_4_ajax'] = str_pad($result[$key]['grupo_4_ajax'], 2, '0', STR_PAD_LEFT);
            $result[$key]['grupo_5_ajax'] = str_pad($result[$key]['grupo_5_ajax'], 2, '0', STR_PAD_LEFT);
            $result[$key]['grupo_6_ajax'] = str_pad($result[$key]['grupo_6_ajax'], 2, '0', STR_PAD_LEFT);
            $result[$key]['grupo_7_ajax'] = str_pad($result[$key]['grupo_7_ajax'], 2, '0', STR_PAD_LEFT);
        }
        $response->getBody()->write(json_encode( [$result, $date] ));
        return $response;
    });
});