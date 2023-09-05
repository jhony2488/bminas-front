<?php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Firebase\JWT\JWT;

$app->group('/tickets', function () use ($app, $verifica) {

    //Envia Ticket
    $app->post('/', function (Request $request, Response $response, array $args) {
        $getCookie = GetToken::tokenArray($request)->nam;
        $postData = $request->getParsedBody();
        $postData['name'] = $getCookie;
        if ($_FILES["attachment"]["name"] != "") {
            $target_dir = "../../tickets_archives/";
            if (!file_exists($target_dir)) {
                mkdir($target_dir, 0777, true);
            }
            $ext = strtolower(strrchr($_FILES["attachment"]["name"], "."));
            $nome_atual = md5(uniqid(time())) . $ext;
            $target_file = $target_dir . basename($nome_atual);
            move_uploaded_file($_FILES["attachment"]["tmp_name"], $target_file);
        } else {
            $nome_atual = "";
        }
        if ($postData['comment'] == '') {
            $response->getBody()->write(json_encode(["error" => true, "message" => "Ocorreu um erro mensagem nao definida!"]));
        } else {
            try {
                $postData["date"] = date("Y-m-d H:i:s");
                $stmt = $this->db->prepare("INSERT into tickets (title,message,user,date,archive) values(?,?,?,?,?)");
                $stmt->execute([$postData["title"], $postData["comment"], $getCookie, $postData["date"], $nome_atual]);
                $response->getBody()->write(json_encode(["error" => false]));
            } catch (Exeption $e) {
                $response->getBody()->write(json_encode(["error" => true, "message" => "Ocorreu um erro interno!"]));
            }
        }
    });

    //Mostrar tickets 
    $app->get('/', function (Request $request, Response $response, array $args) {
        $getCookie = GetToken::tokenArray($request);
        $stmt = $this->db->prepare("SELECT * FROM tickets WHERE user = ? and response_id is null order by ticket desc");
        $stmt->execute([$getCookie->nam]);
        $result = $stmt->fetchAll();
        $response->getBody()->write(json_encode($result));
    });

    //Mostrar tickets 
    $app->get('/comments/{id}', function (Request $request, Response $response, array $args) {
        $id = $args['id'];
        $getCookie = GetToken::tokenArray($request);
        $stmt = $this->db->prepare("SELECT * FROM tickets WHERE ticket = ? and user = ? ");
        $stmt->execute([$id, $getCookie->nam]);
        $result = $stmt->fetch();
        $response->getBody()->write(json_encode($result));
    });

    //Resposta tickets
    $app->get('/allcomments/{id}', function (Request $request, Response $response, array $args) {
        $id = $args['id'];
        $stmt = $this->db->prepare("SELECT * FROM tickets WHERE response_id = ? ");
        $stmt->execute([$id]);
        $result = $stmt->fetchAll();
        $response->getBody()->write(json_encode($result));
    });

    $app->post('/response', function (Request $request, Response $response, array $args) {
        $getCookie = GetToken::tokenArray($request)->nam;
        $postData = $request->getParsedBody();
        $postData['name'] = $getCookie;
        if ($_FILES["attachment"]["name"] != "") {
            $target_dir = "../../tickets_archives/";
            if (!file_exists($target_dir)) {
                mkdir($target_dir, 0777, true);
            }
            $ext = strtolower(strrchr($_FILES["attachment2"]["name"], "."));
            $nome_atual = md5(uniqid(time())) . $ext;
            $target_file = $target_dir . basename($nome_atual);
            move_uploaded_file($_FILES["attachment2"]["tmp_name"], $target_file);
        } else {
            $nome_atual = "";
        }
        if ($postData['response'] == '') {
            $response->getBody()->write(json_encode(["error" => true, "message" => "Ocorreu um erro mensagem nao definida!"]));
        } else {
            try {
                $postData["date"] = date("Y-m-d H:i:s");
                $stmt = $this->db->prepare("INSERT into tickets (message,response_id,user,date,archive) values(?,?,?,?,?)");
                $stmt->execute([$postData["response"], $postData["id"], $getCookie, $postData["date"], $nome_atual]);
                $response->getBody()->write(json_encode(["error" => false]));
                // print_r($postData);
            } catch (Exeption $e) {
                $response->getBody()->write(json_encode(["error" => true, "message" => "Ocorreu um erro interno!"]));
            }
        }
    });

    //Status Ticket Finalizado
    $app->put('/', function (Request $request, Response $response, array $args) {
        $getCookie = GetToken::tokenArray($request)->nam;
        $postData = $request->getParsedBody();
        $postData['name'] = $getCookie;
        $stmty = $this->db->prepare("SELECT * FROM tickets WHERE  ticket = ? and user = ?");
        $stmty->execute(array_values($postData));
        if (!$stmty->fetch()) {
            $response->getBody()->write(json_encode(["error" => true, "message" => "Ocorreu um erro interno!"]));
        } else {
            $postData['date'] = date("Y-m-d H:i:s");
            $stmt = $this->db->prepare("UPDATE tickets set status = '2', date = ? WHERE ticket = ? or response_id = ?");
            $stmt->execute([$postData['date'], $postData['id'], $postData['id']]);
            $response->getBody()->write(json_encode(["error" => false]));
        }
    });


    // Mostra a tabela de notifacações
    $app->post('/notificacao', function (Request $request, Response $response, array $args) {
        $postData = $request->getParsedBody();
        $getCookie = GetToken::tokenArray($request)->sub;
        $postData['user_id'] = $getCookie;
        if ($postData['inicio'] == '' || $postData['final'] == '') {
            $postData['inicio'] = date('Y-m-d');
            $postData['final'] = date('Y-m-d');
        }
        $stmt = $this->db->prepare("SELECT id,user_id,title,message,status,created_at FROM `important_messages`
            WHERE user_id = ? and (cast(created_at as date)>= ? and cast(created_at as date)<= ?) order by created_at desc");
        $stmt->execute([$postData['user_id'], $postData['inicio'], $postData['final']]);
        $result = $stmt->fetchAll();
        // echo $stmt;
        $response->getBody()->write(json_encode($result));
    });

    //Mostra notifcações nao lidas
    $app->post('/notify', function (Request $request, Response $response, array $args) {
        $postData = $request->getParsedBody();
        $getCookie = GetToken::tokenArray($request)->sub;
        $postData['user_id'] = $getCookie;

        $stmt = $this->db->prepare("SELECT id,user_id,title,message,status,created_at FROM `important_messages`
            WHERE user_id in (?,3642) and status = 0 order by created_at desc");
        $stmt->execute([$postData['user_id']]);
        $result = $stmt->fetchAll();
        // echo $stmt;
        $response->getBody()->write(json_encode($result));
    });


    //atualiza o status para lida
    $app->put('/read', function (Request $request, Response $response, array $args) {
        $postData = $request->getParsedBody();
        $getCookie = GetToken::tokenArray($request)->sub;
        $postData['user_id'] = $getCookie;
        $postData['date_up'] = date('Y-m-d');

        $stmt = $this->db->prepare("UPDATE important_messages SET status = 1, updated_at = ? WHERE user_id = ? and status = 0 ");
        $stmt->execute([$postData['date_up'], $postData['user_id']]);
        $response->getBody()->write(json_encode(["error" => false]));
    });

    //Mostra mesagem
    $app->post('/view', function (Request $request, Response $response, array $args) {
        $postData = $request->getParsedBody();
        $getCookie = GetToken::tokenArray($request)->sub;
        $postData['user_id'] = $getCookie;

        $stmt = $this->db->prepare("SELECT message FROM `important_messages`
        WHERE user_id = ? and id = ? ");
        $stmt->execute([$postData['user_id'], $postData['id']]);
        $result = $stmt->fetchAll();
        // echo $stmt;
        $response->getBody()->write(json_encode($result));
    });

      //Mostrar titulos tickets 
      $app->post('/informacao', function (Request $request, Response $response, array $args) {
        $stmt = $this->db->prepare("SELECT * FROM tickets_quest");
        $stmt->execute();
        $result = $stmt->fetchAll();
        $response->getBody()->write(json_encode($result));
    });
})->add($checkSession);
