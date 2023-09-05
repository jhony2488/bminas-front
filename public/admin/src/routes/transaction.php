<?php
date_default_timezone_set('America/Sao_Paulo');

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Firebase\JWT\JWT;

$app->group('/movimentacao', function () use ($app) {

  // $app->get('/search', function (Request $request, Response $response, array $args) {
  //     $getCookie = GetToken::tokenArray($request)->nam;
  //     $postData['name'] = $getCookie;
  //     $stmt = $this->db->prepare("SELECT * FROM `transactions` where (time >= DATE(SUBDATE(NOW(), INTERVAL 3 DAY))) and (sender = ? or receiver = ?) and amount > 0 ORDER BY `transaction_id` DESC");
  //     $stmt->execute([$postData['name'], $postData['name']]);
  //     $result = $stmt->fetchAll();
  //     $response->getBody()->write(json_encode([$result, $getCookie]));
  // });

  $app->post('/pesquisar', function (Request $request, Response $response, array $args) {
    $postData = $request->getParsedBody();
    $getCookie = GetToken::tokenArray($request)->nam;
    $postData['name'] = $getCookie;
    $postData['user_id'] = GetToken::tokenArray($request)->sub;
    // $stmt = null;
    // $result = null;

    switch ($postData['type']) {
      case 'games':

        $stmt = $this->db->prepare("SELECT b.numeros as numeros_ajax, b.jogo_id as jogo_id_ajax, c.grupo as grupo_ajax, c.loteria_id as loteria_id_ajax FROM transactions a 
          LEFT join jogos b on a.jogo = b.jogo_id 
          LEFT join loterias c on b.loteria = c.loteria_id 
          where a.jogo is not null and cast(a.time as date)= ? and a.sender = ? and a.amount > 0
          ORDER BY 1 DESC");

        $stmt->execute([$postData['time'], $postData['name']]);
        $result = $stmt->fetchAll();
        break;

      case 'game':

        $stmt = $this->db->prepare("SELECT b.numeros as numeros_ajax, b.jogo_id as jogo_id_ajax, c.grupo as grupo_ajax,sum(IF ((cast(a.time as date) = ?) and a.type = 100,a.amount,0)) as aposta_ajax,
          sum(IF ((cast(a.time as date) = ? ) and a.type = 101,a.amount,0)) as estorno_ajax FROM transactions a 
          LEFT join jogos b on a.jogo = b.jogo_id 
          LEFT join loterias c on b.loteria = c.loteria_id 
          where a.jogo is not null and cast(a.time as date)= ? and a.sender = ? and a.amount > 0
          GROUP by 1 
          ORDER BY 1 DESC");

        $stmt->execute([$postData['time'], $postData['time'], $postData['time'], $postData['name']]);
        $result = $stmt->fetchAll();
        break;


      case 'grupo':
        $params = $postData['grupo'];
        array_unshift($params, $postData['time']);
        array_unshift($params, $postData['time']);
        array_unshift($params, $postData['time']);
        array_push($params,  $postData['name']);
        $place_holders = implode(',', array_fill(0, count($postData['grupo']), '?'));
        $stmt = $this->db->prepare("SELECT c.loteria_id as loteria_id_ajax,c.descricao as descricao_ajax, sum(IF ((cast(a.time as date) = ?) and a.type = 100,a.amount,0)) as aposta_ajax,sum(IF ((cast(a.time as date) = ? ) and a.type = 101,a.amount,0)) as estorno_ajax, c.descricao as descricao_ajax, sum(b.premiado) as premiado_ajax, sum(b.conferido) as conferido_ajax FROM transactions a 
        LEFT join jogos b on a.jogo = b.jogo_id 
        LEFT join loterias c on b.loteria = c.loteria_id 
        where a.jogo is not null and cast(a.time as date)= ? and c.grupo in($place_holders) and a.amount > 0  and a.sender = ? and type<>'102'
        GROUP by 1 
        ORDER BY c.loteria_id");
        $stmt->execute($params);
        $result = $stmt->fetchAll();
        break;

      case 'subgrupo':
        $stmt = $this->db->prepare("SELECT b.jogo_id as jogo_id_ajax,b.colocacao_label as colocacao_label_ajax, b.premiado as premiado_ajax, b.aviso_premiacao as aviso_premiacao_ajax, b.numeros as numeros_ajax, d.sigla as sigla_ajax 
                FROM jogos b 
                LEFT join loterias c on b.loteria = c.loteria_id 
                LEFT join modalidades d on d.modalidade_id = b.modalidade_id
                where b.jogo_id is not null and b.data = ? and c.loteria_id = ? and b.usuario_id = ? and b.valor > 0  
                ORDER BY c.loteria_id ASC");


        $teste = $stmt->execute([$postData['time'], $postData['grupo'], $postData['user_id']]);
        $result = $stmt->fetchAll();
        break;

      case 'deposito':
        $stmt = $this->db->prepare("SELECT a.transaction_id as transaction_id_ajax,a.time as time_ajax,a.type as type_ajax,a.amount as amount_ajax,a.saldo as saldo_ajax,a.saldo_sender as saldo_sender_ajax,a.saldo_receiver as saldo_receiver_ajax,a.status as status_ajax,a.sender as sender_ajax
          FROM transactions a 
          WHERE cast(a.time as date) = ? and a.type in(1,3,5,7) and a.sender = ?
          and a.amount > 0  ORDER BY a.transaction_id DESC");

        $stmt->execute([$postData['time'], $postData['name']]);
        $result = $stmt->fetchAll();
        break;

      case 'saque':
        $stmt = $this->db->prepare("SELECT a.transaction_id as transaction_id_ajax,a.time as time_ajax,a.type as type_ajax,a.amount as amount_ajax,a.saldo as saldo_ajax,a.saldo_sender as saldo_sender_ajax,a.saldo_receiver as saldo_receiver_ajax,a.status as status_ajax
            FROM transactions a 
            WHERE cast(a.time as date) = ? and a.type in(2,6) and a.sender = ? 
            and a.amount > 0  ORDER BY a.transaction_id DESC");

        $stmt->execute([$postData['time'], $postData['name']]);
        $result = $stmt->fetchAll();
        break;
      case 'premio':
        $stmt = $this->db->prepare("SELECT a.transaction_id as transaction_id_ajax,a.time as time_ajax, a.type as type_ajax,a.amount as amount_ajax,a.saldo as saldo_ajax,a.saldo_sender as saldo_sender_ajax,a.saldo_receiver as saldo_receiver_ajax,a.status as status_ajax
                  FROM transactions a 
            LEFT JOIN jogos b on b.jogo_id = a.jogo
            left JOIN loterias c on b.loteria = c.loteria_id
            WHERE cast(a.time as date) = ? and a.type = 102 and a.sender = ? 
            and a.amount > 0 and c.loteria_id =  ? ORDER BY a.transaction_id DESC");

        $stmt->execute([$postData['time'], $postData['name'], $postData['grupo']]);
        $result  = $stmt->fetchAll();

        break;

      case 'premio_loterias':
        $stmt = $this->db->prepare("SELECT sum(a.amount) as vlr_premio_total_ajax,c.descricao as descricao_ajax,c.loteria_id as loteria_id_ajax
              FROM transactions a 
              LEFT JOIN jogos b on b.jogo_id = a.jogo
              left JOIN loterias c on b.loteria = c.loteria_id
              WHERE cast(a.time as date) = ? and a.type = 102 and a.sender = ? 
              and a.amount > 0 GROUP BY 2,3 ");
        $stmt->execute([$postData['time'], $postData['name']]);
        $result  = $stmt->fetchAll();

        break;

      case 'bonus':
        $stmt = $this->db->prepare("SELECT a.transaction_id as transaction_id_ajax,a.time as time_ajax,a.type as type_ajax,a.amount as amount_ajax,a.saldo as saldo_ajax,a.saldo_sender as saldo_sender_ajax,a.saldo_receiver as saldo_receiver_ajax,a.status as status_ajax 
                FROM transactions a 
                WHERE cast(a.time as date) = ? and a.type in(4,8,103) and a.sender = ? 
                and a.amount > 0  ORDER BY a.transaction_id DESC");

        $stmt->execute([$postData['time'], $postData['name']]);
        $result = $stmt->fetchAll();
        break;
      case 'saldo_anterior':

        $stmt = $this->db->prepare("SELECT saldo as saldo_ajax FROM transactions WHERE sender = ? and time <= ? and type not in (103) ORDER BY transaction_id DESC LIMIT 1");
        $stmt->execute([$postData['name'], $postData['time_anterior']]);

        $stmt2 = $this->db->prepare("SELECT type as type_ajax, amount as type_valor_ajax,sender as sender_ajax,status as status_ajax from transactions b WHERE cast(time as date) =  ? and (receiver = ? OR sender = ?) ");
        $stmt2->execute([$postData['time'], $postData['name'], $postData['name']]);

        $result1 = $stmt->fetchAll();
        $result2 = $stmt2->fetchAll();

        $result = [$result1, $result2];
        break;
      default:
        # code...
        break;
    }

    //     $stmt = $this->db->prepare("SELECT * FROM `transactions` where (time >= DATE(SUBDATE(NOW(), INTERVAL 6 DAY))) and (sender = ? or receiver = ?) and amount > 0 ORDER BY `transaction_id` DESC");
    //     $stmt->execute([$postData['name'], $postData['name']]);
    //     $result = $stmt->fetchAll();
    $response->getBody()->write(json_encode([$result, $getCookie]));
  });

  //Mostra modal
  $app->get('/{id:[0-9]+}', function (Request $request, Response $response, array $args) {
    $id = $args['id'];
    $getCookie = GetToken::tokenArray($request)->sub;
    $postData['sub'] = $getCookie;
    $stmt = $this->db->prepare("SELECT a.*, c.*, d.*, c.descricao as descloteria, a.bonus as bnjogos, a.cotacao as cota, a.created_at as data_atual, b.type, b.time
    FROM `jogos` a
    left join transactions b on b.jogo = a.jogo_id 
    left join loterias c on a.loteria = c.loteria_id 
    left join cotacoes d on d.modalidade_id = a.modalidade_id  where usuario_id = ?  and jogo_id = ?");
    $stmt->execute([$postData['sub'], $id]);
    $result = $stmt->fetch();
    $inicio = $result['data'];
    $loteria = $result['loteria_id'];


    // $stmt6 = $this->db->prepare("SELECT indication_id FROM users  where username = ?");
    // $stmt6->execute([$postData['name']]);
    // $result6 = $stmt6->fetch();


    // if ($result['type'] == 4 && $result['transaction_origem'] != 0) {
    //   $stmt3 = $this->db->prepare(" SELECT a.username as sender,c.time,c.status,c.transaction_id,c.type,c.amount,c.receiver FROM users a 
    //     left join transactions b on a.username = b.sender
    //     left join transactions c on b.transaction_id = c.transaction_origem
    //     WHERE c.transaction_id = ? ");
    //   $stmt3->execute([$id]);
    //   $newResult = $stmt3->fetch();
    // } else if ($result['type'] == 4 && $result['transaction_origem'] == 0 && $result6['indication_id'] != 1) {
    //   $stmt3 = $this->db->prepare("SELECT b.username as sender,c.time,c.status,c.transaction_id,c.type,c.amount,c.receiver FROM users a 
    //     left join users b on b.user_id = a.indication_id
    //     left join transactions c on a.username = c.receiver 
    //     WHERE c.transaction_id = ? ");
    //   $stmt3->execute([$id]);
    //   $newResult = $stmt3->fetch();
    // } else {
    //   $newResult = $result;
    // }

    $stmt2 = $this->db->prepare("SELECT a.*,b.descricao, c.descricao AS status FROM `sorteios` a 
					left join loterias b on a.loteria_id=b.loteria_id 
					left join status_sorteios c on a.status_sorteio_id = c.status_id
                    WHERE cast(a.data as date) = ? and a.loteria_id= ? and a.status_sorteio_id = 4 LIMIT 1");
      $stmt2->execute([$inicio, $loteria]);
    $result2 = $stmt2->fetch();
    $response->getBody()->write(json_encode([$result, $result2]));
    // $response->getBody()->write(json_encode($result));
  });

  // //Pesquisar
  $app->post('/indication', function (Request $request, Response $response, array $args) {
    $postData = $request->getParsedBody();
    $getCookie = GetToken::tokenArray($request)->sub;
    $postData['user_id'] = $getCookie;
    if ($postData['inicio'] == '' || $postData['final'] == '') {
      $postData['inicio'] = date('Y-m-d');
      $postData['final'] = date('Y-m-d');
    }
    $stmt = $this->db->prepare("SELECT a.phone,a.username,b.time,b.amount,b.status,b.transaction_id,b.type,c.amount as bonus_amount FROM users a 
        left join transactions b on a.username = b.sender
        left join transactions c on b.transaction_id = c.transaction_origem
        WHERE a.indication_id = ? and b.type = 1 and b.status = 2 and (cast(b.time as date)>= ? and cast(b.time as date)<= ?) order by time desc");
    $stmt->execute([$postData['user_id'], $postData['inicio'], $postData['final']]);
    $result = $stmt->fetchAll();
    // echo $stmt;
    $response->getBody()->write(json_encode($result));
  });

  // //Pesquisar cadastro
  $app->post('/cadindication', function (Request $request, Response $response, array $args) {
    $postData = $request->getParsedBody();
    $getCookie = GetToken::tokenArray($request)->sub;
    $postData['user_id'] = $getCookie;
    if ($postData['inicio'] == '' || $postData['final'] == '') {
      $postData['inicio'] = date('Y-m-d');
      $postData['final'] = date('Y-m-d');
    }
    $stmt = $this->db->prepare("SELECT a.username,a.phone,a.email,b.time,b.amount,b.type FROM users a 
            left join transactions b on a.username = b.receiver
            left join users c on c.indication_id = a.user_id
            where a.indication_id = ? and type = 4 and (cast(b.time as date)>= ? and cast(b.time as date)<= ?) GROUP by 1,2,3,4,5,6 order by a.username asc");
    $stmt->execute([$postData['user_id'], $postData['inicio'], $postData['final']]);
    $result = $stmt->fetchAll();
    // echo $stmt;
    $response->getBody()->write(json_encode($result));
  });

  // //Pesquisar
  $app->post('/days', function (Request $request, Response $response, array $args) {
    $postData = $request->getParsedBody();
    $getCookie = GetToken::tokenArray($request)->sub;
    $postData['user_id'] = $getCookie;
    if ($postData['inicio'] == '') {
      $postData['inicio'] = date('Y-m-d');
    }
    $stmt = $this->db->prepare("SELECT a.username,a.created,max(b.time) as time,DATEDIFF (?,max(b.time)) AS dias,a.phone,a.email
            FROM users a 
            left join transactions b on a.username = b.sender and b.type = 1 and b.status = 2 
             WHERE a.indication_id = ?  GROUP by 1,2,5,6  ORDER by time DESC");
    $stmt->execute([$postData['inicio'], $postData['user_id']]);
    // $stmt->execute([$postData['inicio']]);
    $result = $stmt->fetchAll();
    // echo $stmt;
    $response->getBody()->write(json_encode($result));
  });

  //Reivindicar o premio
  $app->post('/claim', function (Request $request, Response $response, array $args) {
    $postData = $request->getParsedBody();
    $getCookie = GetToken::tokenArray($request)->sub;
    $postData['user_id'] = $getCookie;
    $postData['username'] = GetToken::tokenArray($request)->nam;
    $postData['time'] = date("Y-m-d H:i:s");
    $postData['ipaddr'] = getenv("REMOTE_ADDR");

    $stmt3 = $this->db->prepare("SELECT aviso_premiacao FROM jogos where jogo_id = ?");
    $stmt3->execute([$postData['jogo']]);
    $result3 = $stmt3->fetch();

    if ($result3['aviso_premiacao'] == 's') {
      $response->getBody()->write(json_encode(["error" => true, "message" => "Prêmio já resgatado!"]));
    } else {
      $stmt = $this->db->prepare("SELECT sum(valor) as pagamento FROM `premios` where jogo_id = ?");
      $stmt->execute([$postData['jogo']]);
      $result = $stmt->fetch();

      $stmt2 = $this->db->prepare("SELECT debit_premio,debit_base from users where user_id = ?");
      $stmt2->execute([$postData['user_id']]);
      $result2 = $stmt2->fetch();

      $premio = $result2['debit_premio'] + $result2['debit_base'];

      $postData['premio'] = $premio;

      $stmt = $this->db->prepare("UPDATE jogos set aviso_premiacao = 's' , premio_total = ? where premiado = 1 and jogo_id = ? and usuario_id = ?");
      $stmt->execute([$result['pagamento'], $postData['jogo'], $postData['user_id']]);

      $stmt = $this->db->prepare("UPDATE users set debit_premio = (debit_premio + ?)  where user_id = ?");
      $stmt->execute([$result['pagamento'], $postData['user_id']]);

      $stmt = $this->db->prepare("INSERT INTO `transactions` (`jogo`, `saldo`, `time`, `type`, `amount`, `status`, `sender`, `receiver`, `ip_address`) 
      VALUES ( ?, ?, ?, '102', ?, '2', ?, 'BPremiado', ?)");
      $stmt->execute([$postData['jogo'], $postData['premio'], $postData['time'], $result['pagamento'], $postData['username'], $postData['ipaddr']]);

      $response->getBody()->write(json_encode(["error" => false, "premio" => $result['pagamento']]));
    }
  });

  //Demostrativo
  $app->get('/statement', function (Request $request, Response $response, array $args) {
    $postData = $request->getParsedBody();
    $postData['username'] = GetToken::tokenArray($request)->nam;
    $time = date("Y-m-d");
    $begTime  = date('Y-m-d', strtotime('-5 days', strtotime($time)));
    $lasTime = date("Y-m-d");

    $stmt = $this->db->prepare("SELECT cast(a.time as date) as time,
    sum(IF ((cast(a.time as date)>='$begTime' and cast(a.updated_at as date)<='$lasTime') and a.type = 1 ,a.amount,0)) as deposito,
    sum(IF ((cast(a.updated_at as date)>='$begTime' and cast(a.updated_at as date)<='$lasTime') and a.type = 2,a.amount,0)) as saque,
    sum(IF ((cast(a.time as date)>='$begTime' and cast(a.time as date)<='$lasTime') and a.type = 100,a.amount,0)) as aposta,
    sum(IF ((cast(a.time as date)>='$begTime' and cast(a.time as date)<='$lasTime') and a.type = 102,a.amount,0)) as premio
    FROM transactions a 
    WHERE a.status = 2 and sender = ? and (cast(time as date)>='$begTime' and cast(time as date)<='$lasTime')
    GROUP by 1 ORDER BY time ASC");
    $stmt->execute([$postData['username']]);
    $result = $stmt->fetchAll();

    $response->getBody()->write(json_encode($result));
  });
})->add($checkSession);
