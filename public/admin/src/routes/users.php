<?php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Firebase\JWT\JWT;

$app->group('/users', function () use ($app, $checkSession) {

    // Login
    $app->post('/login', function (Request $request, Response $response, array $args) {
        $postData = $request->getParsedBody();
        $postData['password'] = md5($postData['password']);

        if (strlen($postData['username']) < 36) {
            $stmt = $this->db->prepare("SELECT a.*, t2.premios FROM users a left join (SELECT usuario_id, count(*) as premios FROM `jogos` where premiado=1 and aviso_premiacao is null and data='" . Date('Y-m-d') . "' GROUP BY 1) t2 on a.user_id=t2.usuario_id WHERE username = ? AND password = ?");
            $postData = array_values($postData);
            $stmt->execute($postData);
            $result = $stmt->fetch();
        }


        if ($result) {
            if ($result['status'] == 0) {
                $response->getBody()->write(json_encode(["error" => true, "type" => 1, "message" => "Favor entrar em contato com a equipe de suporte pelo chat."]));
                // } else if ($result['phone_validation'] == 0) {
                //     $response->getBody()->write(json_encode(["error" => true, "type" => 2, "message" => "Confirme seu numero de telefone!"]));
            } else {
                $token = array(
                    "sub" => $result['user_id'],
                    "nam" => $result['username'],
                    "per" => $result['gerente'],
                    "tma" => $result['type_manager'],
                    "sts" => $result['status'],
                    "exp" => time() + 1800,
                    "prm" => $result['premios'],
                    "cpf" => $result['company'],
                    "prf" => $result['profile'],
                );
                $jwt = JWT::encode($token, "6d65f7c9864bcd2a6e3932250ea515bc");
                setcookie("token", $jwt, time() + 1800, '/');

                // $stmt = $this->db->prepare("UPDATE jogos set aviso_premiacao = 's' where premiado = 1 and aviso_premiacao is null and data='" . Date('Y-m-d') . "' and usuario_id = ".$result['user_id']);
                // $stmt->execute();

                $response->getBody()->write(json_encode(["error" => false]));
            }
        } else {
            $response->getBody()->write(json_encode(["error" => true, "type" => 1, "message" => "Nome de usuário ou senha incorretos."]));
        }
    });

    // Cadastro
    $app->post('/register', function (Request $request, Response $response, array $args) {
        $postData = $request->getParsedBody();
        if ($postData['email']) {
            $stmt = $this->db->prepare("SELECT user_id, username, email, phone FROM users WHERE username = ? OR email = ? OR phone = ?");
            $stmt->execute([$postData['username'], $postData['email'], $postData['phone']]);
        } else {
            $stmt = $this->db->prepare("SELECT user_id, username, email, phone FROM users WHERE username = ? OR email = ? OR phone = ?");
            $stmt->execute([$postData['username'], $postData['email'], $postData['phone']]);
        }
        $result = $stmt->fetch();


        if (!$result) {
            if (strlen($postData['username']) <= 20) {


                // $newPost['ind'] = 3642;
                $stmt2 = $this->db->prepare("SELECT type_manager,saldo_ind FROM users WHERE user_id = ?");
                $stmt2->execute([$postData['ind']]); //newpost se for voltar a campanha
                $result2 = $stmt2->fetch();
                if ($result2['type_manager']  == 'Y') {
                    if ($postData['ind'] == 2) {
                        $postData['bonus_ind'] = 'N';
                    }
                    $postData['saldo_ind'] = $result2['saldo_ind'];
                }

                // if ($postData['ind'] == 1) {
                //     $postData['ind'] = 3642;
                // }

                $postData['password'] = md5($postData['password']);
                $postData['date'] = date("Y-m-d H:i:s");
                $postData['ip'] = getenv("REMOTE_ADDR");
                $postData['phone_validation_code'] = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

                $stmt2 = $this->db->prepare("INSERT INTO users (username, email, first_name, last_name, password,phone,zip,city,uf,manager_id,indication_id,bonus_ind,debit_base,social,date_birth,created, ip_address, phone_validation, phone_validation_code)
                VALUES (?,?,?,?,?,?,?,Upper(?),Upper(?),?,?,?,?,?,?,?,?, 0, ?)");
                $stmt2->execute(array_values($postData));
                // print_r($postData);

                if ($result2['type_manager']  == 'Y') {
                    $postData2['type'] = 4;
                    if ($postData['ind'] == 3642) {
                        $postData2['sender'] = 'CAMAPANHA BPREMIADO 10';
                    } else {
                        $postData2['sender'] = 'BONUS-DEP';
                    }
                    $postData2['status'] = 2;
                    $postData2['amount'] = $postData['saldo_ind'];
                    $postData2['receiver'] = $postData['username'];
                    $postData2['time'] = date('Y-m-d H:i:s');
                    $postData2['ip'] = getenv("REMOTE_ADDR");
                    $postData2['saldo'] = $postData['saldo_ind'];
                    $stmt3 = $this->db->prepare("INSERT into transactions (type,receiver,status,amount,sender,time,ip_address,saldo) 
                  values(?,?,?,?,?,?,?,?)");
                    $stmt3->execute(array_values($postData2));
                }

                // $UserID = 'ba41e3d3-cd82-41fb-b18c-cd9ed9e13da0';
                // $Token = '57489783';
                // $destino = '55' . str_replace('-', '', $postData['phone']);

                // $mensagem = 'BetsJogoDoBicho: Código de verificação de telefone ' . $postData['phone_validation_code'];
                // $mensagem = urlencode($mensagem);
                // $URLGateway = 'http://www.misterpostman.com.br/gateway.aspx?UserID=' . $UserID . '&Token=' . $Token . '&NroDestino=' . $destino . '&Mensagem=' . $mensagem . '';
                // $Content = file_get_contents($URLGateway);

                $response->getBody()->write(json_encode(["error" => false]));
            } else {
                $response->getBody()->write(json_encode(["error" => true, "message" => "Máximo de 20 caracteres."]));
            }
        } else {
            // $response->getBody()->write(json_encode(["error" => true, "message" => "Nome de usuário e/ou email/telefone já cadastrado."]));
            if ($postData['email'] == $result['email']) {
                $response->getBody()->write(json_encode(["error" => true, "message" => "Email já cadastrado."]));
            } else if ($postData['phone'] == $result['phone']) {
                $response->getBody()->write(json_encode(["error" => true, "message" => "Telefone já cadastrado."]));
            } else if (strtoupper($postData['username']) == strtoupper(trim($result['username']))) {
                $response->getBody()->write(json_encode(["error" => true, "message" => "Nome de usuário já cadastrado."]));
            }
            // else if ($postData['cpf'] == $result['company']) {
            //     $response->getBody()->write(json_encode(["error" => true, "message" => "CPF já cadastrado."]));
            // }
        }
    });

    $app->post('/resendCode', function (Request $request, Response $response, array $args) {
        $postData = $request->getParsedBody();
        $postData['password'] = md5($postData['password']);
        $phone_validation_code = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

        $UserID = 'ba41e3d3-cd82-41fb-b18c-cd9ed9e13da0';
        $Token = '57489783';
        $destino = '55' . str_replace('-', '', $postData['phone']);

        $mensagem = 'BetsJogoDoBicho: Código de verificação de telefone ' . $phone_validation_code;
        $mensagem = urlencode($mensagem);
        $URLGateway = 'http://www.misterpostman.com.br/gateway.aspx?UserID=' . $UserID . '&Token=' . $Token . '&NroDestino=' . $destino . '&Mensagem=' . $mensagem . '';
        $Content = file_get_contents($URLGateway);

        $postData = array_values($postData);
        array_unshift($postData, $phone_validation_code);
        $stmt = $this->db->prepare("UPDATE users SET phone_validation_code = ?, phone = ? WHERE username = ? AND password = ? AND phone_validation = 0");
        $stmt->execute($postData);
    });

    $app->get('/verificationCode/{username}/{code}', function (Request $request, Response $response, array $args) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE username = ? AND phone_validation_code = ?");
        $stmt->execute(array_values($args));

        $result = $stmt->fetch();
        if ($result) {
            $token = array(
                "sub" => $result['user_id'],
                "nam" => $result['username'],
                "per" => $result['gerente'],
                "sts" => $result['status'],
                "exp" => time() + 1800,
            );
            $jwt = JWT::encode($token, "6d65f7c9864bcd2a6e3932250ea515bc");
            setcookie("token", $jwt, time() + 1800, '/');

            $stmt2 = $this->db->prepare("UPDATE users SET phone_validation = 1 WHERE username = ? AND phone_validation_code = ?");
            $stmt2->execute(array_values($args));

            $response->getBody()->write(json_encode(["error" => false]));
        } else {
            $response->getBody()->write(json_encode(["error" => true, "message" => "Código de verificação incorreto."]));
        }
    });

    // $app->get('/verifyCodePassword/{username}/{code}', function (Request $request, Response $response, array $args) {
    //     $stmt = $this->db->prepare("SELECT * FROM users WHERE username = ? AND phone_validation_code = ?");
    //     $stmt->execute(array_values($args));

    //     $result = $stmt->fetch();
    //     if ($result) {
    //         $token = array(
    //             "sub" => $result['user_id'],
    //             "nam" => $result['username'],
    //             "per" => $result['gerente'],
    //             "sts" => $result['status'],
    //             "exp" => time() + 1800,
    //         );
    //         $jwt = JWT::encode($token, "6d65f7c9864bcd2a6e3932250ea515bc");
    //         setcookie("token", $jwt, time() + 1800, '/');

    //         $stmt2 = $this->db->prepare("UPDATE users SET phone_validation = 1 WHERE username = ? AND phone_validation_code = ?");
    //         $stmt2->execute(array_values($args));

    //         $response->getBody()->write(json_encode(["error" => false]));
    //     } else {
    //         $response->getBody()->write(json_encode(["error" => true, "message" => "Código de verificação incorreto."]));
    //     }
    // });
    // $app->get('/sendCode/{username}/{phone?}', function (Request $request, Response $response, array $args) {
    $app->post('/sendCode', function ($request, $response, array $args) {
        $postData = $request->getParsedBody();

        $stmt = $this->db->prepare("SELECT * FROM users WHERE username = ? OR phone = ?");
        $stmt->execute(array_values($postData));
        $result = $stmt->fetch();

        if ($result) {
            $code = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            $stmt2 = $this->db->prepare("UPDATE users SET phone_validation_code = $code WHERE username = ?");
            $stmt2->execute([$result['username']]);




            // Update the path below to your autoload.php, 
            // see https://getcomposer.org/doc/01-basic-usage.md 
            // require __DIR__ .  '/slim/vendor/autoload.php';

            // use Twilio\Rest\Client; 

           
            // $twilio = new Client($sid, $token);

            // $message = $twilio->messages
            //     ->create(
            //         "+5534991201226", // to 
            //         array(
            //             "body" => "Code: ' . $code  . ' Bicho Premiado, utilize este codigo para redefinir sua senha: ' . $code . '."
            //         )
            //     );

            // print($message->sid);
            $token = md5('bb592346688dd12298e8d7a9518943f0'.$result['username']);

            $url = "https://api.twilio.com/2010-04-01/Accounts/ACb593f1a0b3411feb1fdfe1eeeb76085a/Messages.json";
            $from = "+18454437869";
            $to = "+5534991201226"; // twilio trial verified number
            $body = "Seu codigo de verificação é: ". $code . "\n\nhttps://bichopremiado.com/novasenha?token=".$token."&code=".$code."&username=".$result['username']. "\n\nverification code is: " . $code;
            $sid    = "ACb593f1a0b3411feb1fdfe1eeeb76085a";
            $tokenTwilio  = "e18d00e745c76c6d9b15e5e14a8fde71";
            $data = array (
                    'From' => $from,
                    'To' => $to,
                    'Body' => $body,
            
                );
            $post = http_build_query($data);
            $x = curl_init($url );
            curl_setopt($x, CURLOPT_POST, true);
            curl_setopt($x, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($x, CURLOPT_USERPWD, "$sid:$tokenTwilio");
            curl_setopt($x, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
            curl_setopt($x, CURLOPT_POSTFIELDS, $post);
            $y = curl_exec($x);
            curl_close($x);


            // $UserID = '04a1e864-1f91-4bb4-b0d0-f9f5c6fd1c53';
            // $Token = '20103165';
            // $destino = '55' . str_replace('-', '', $result['phone']);

            
            // // $mensagem =  "Codigo: " . $code  . ". https://imperiodojogo.com/novasenha?token=".$token."&code=".$code."&username=".$result['username'];

            // $mensagem =  'Code: ' . $code  . ' Imperio do jogo, utilize este codigo para redefinir sua senha: ' . $code . '.';
            // $mensagem = urlencode($mensagem);
            // $URLGateway = 'http://www.misterpostman.com.br/gateway.aspx?UserID=' . $UserID . '&Token=' . $Token . '&NroDestino=' . $destino . '&Mensagem=' . $mensagem . '';
            // $Content = file_get_contents($URLGateway);

            //  ENVIO PELO WHATSAPP 
            // $curl = curl_init();

            // curl_setopt_array($curl, [
            //     CURLOPT_PORT => "3333",
            //     CURLOPT_URL => "http://www.imperiodojogo.com:3333/sendText?=",
            //     CURLOPT_RETURNTRANSFER => true,
            //     CURLOPT_ENCODING => "",
            //     CURLOPT_MAXREDIRS => 10,
            //     CURLOPT_TIMEOUT => 30,
            //     CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            //     CURLOPT_CUSTOMREQUEST => "POST",
            //     CURLOPT_POSTFIELDS => "{\n  \"session\":\"password\",\n  \"number\":\"553491201226\",\n  \"text\":\"$code\"\n}",
            //     CURLOPT_HTTPHEADER => [
            //         "Content-Type: application/json",
            //         "apitoken: TOKENMYZAP",
            //         "sessionkey: C8y3U3BFAXDqLg29"
            //     ],
            // ]);

            // curl_exec($curl);
            // $err = curl_error($curl);
            // curl_close($curl);

            $response->getBody()->write(json_encode(["error" => false, "message" => $result['phone']]));
        } else {
            $response->getBody()->write(json_encode(["error" => true, "message" => "Usuário/Celular não existe. Contate nossa equipe."]));
        }
    });


    $app->post('/phoneInfo', function (Request $request, Response $response, array $args) {
        $postData = $request->getParsedBody();
        $postData['password'] = md5($postData['password']);

        $stmt = $this->db->prepare("SELECT phone, phone_validation_code FROM users WHERE username = ? AND password = ? AND phone_validation = 0");
        $stmt->execute(array_values($postData));
        $result = $stmt->fetch(PDO::FETCH_OBJ);

        $UserID = 'ba41e3d3-cd82-41fb-b18c-cd9ed9e13da0';
        $Token = '57489783';
        $destino = '55' . str_replace('-', '', $result->phone);

        $mensagem = 'BetsJogoDoBicho: Código de verificação de telefone ' . $result->phone_validation_code;
        $mensagem = urlencode($mensagem);
        $URLGateway = 'http://www.misterpostman.com.br/gateway.aspx?UserID=' . $UserID . '&Token=' . $Token . '&NroDestino=' . $destino . '&Mensagem=' . $mensagem . '';
        $Content = file_get_contents($URLGateway);

        $response->getBody()->write(json_encode($result->phone));
    });

    $app->group('', function () use ($app) {

        //Mostrar dados do Usuario 
        $app->get('/', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $stmt = $this->db->prepare("SELECT debit_premio as saldo_p_ajax,username,first_name as nome_1_ajax,last_name as nome_2_ajax,email as email_ajax,company as cpf_ajax,bairro as bairro_ajax,zip as cep_ajax,city as cidade_ajax,address as endereco_ajax,uf as estado_ajax,phone as telefone_ajax,ip_address,gerente,type_acc as tipo_conta_ajax,bank as banco_ajax,agency as agencia_ajax,acc as conta_ajax,titular_bank as nome_titular_ajax,language as lingua_ajax,date_birth as aniversario_ajax, status FROM users WHERE user_id = ?");
            $stmt->execute([$getCookie->sub]);
            $result = $stmt->fetch();
            if ($result['status'] == 0) {
                $token = array(
                    "sts" => 0,
                    "exp" => time() + 1800,
                );
                $jwt = JWT::encode($token, "6d65f7c9864bcd2a6e3932250ea515bc");
                setcookie("token", $jwt, time() + 1800, '/');
            }
            $response->getBody()->write(json_encode($result));
        });

        //Mostrar id Gerente
        $app->get('/manager', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request);
            $stmt = $this->db->prepare("SELECT a.user_id,b.manager_id FROM users a left join managers b on a.user_id = b.user_id WHERE a.user_id = ?");
            $stmt->execute([$getCookie->sub]);
            $result = $stmt->fetch();
            $response->getBody()->write(json_encode($result));
        });

        //Atualizar dados do Usuario 
        $app->put('/', function (Request $request, Response $response, array $args) {
            $getCookie = GetToken::tokenArray($request)->sub;
            $postData = $request->getParsedBody();
            $postData['user_id'] = $getCookie;
            if ($postData['password'] != '') {
                $postData['password'] = md5($postData['password']);
                $stmt = $this->db->prepare("UPDATE users set email = ?,first_name = Upper(?),last_name = Upper(?), zip = ?,
                address = Upper(?),bairro = Upper(?),city = Upper(?),uf = Upper(?),language = ?,password = ?,company = ? WHERE user_id = ?");
            } else {
                $stmt = $this->db->prepare("UPDATE users set email = ?,first_name = Upper(?),last_name = Upper(?), zip = ?,
                address = Upper(?),bairro = Upper(?),city = Upper(?),uf = Upper(?),language = ?,company = ? WHERE user_id = ?");
            }
            $stmt->execute(array_values($postData));
            $response->getBody()->write(json_encode($postData));
        });
    })->add($checkSession);
});
