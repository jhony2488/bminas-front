<?php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Firebase\JWT\JWT;

$app->group('/bank', function () use ($app, $verifica) {

    function validaCPF($cpf)
    {

        // Extrai somente os números
        $cpf = preg_replace('/[^0-9]/is', '', $cpf);

        // Verifica se foi informado todos os digitos corretamente
        if (strlen($cpf) != 11) {
            return false;
        }

        // Verifica se foi informada uma sequência de digitos repetidos. Ex: 111.111.111-11
        if (preg_match('/(\d)\1{10}/', $cpf)) {
            return false;
        }

        // Faz o calculo para validar o CPF
        for ($t = 9; $t < 11; $t++) {
            for ($d = 0, $c = 0; $c < $t; $c++) {
                $d += $cpf[$c] * (($t + 1) - $c);
            }
            $d = ((10 * $d) % 11) % 10;
            if ($cpf[$c] != $d) {
                return false;
            }
        }
        return true;
    }

    //Mostrar banco   
    $app->get('/', function (Request $request, Response $response, array $args) {
        $stmt = $this->db->query("SELECT * FROM bank order by cod");
        $result = $stmt->fetchAll();
        $response->getBody()->write(json_encode($result));
    });

    //Mostrar banco
    $app->get('/transfer', function (Request $request, Response $response, array $args) {
        $getCookie = GetToken::tokenArray($request);
        $stmt = $this->db->prepare("SELECT a.name,a.cod FROM bank a left join users b on a.cod = b.bank where b.user_id = ? ");
        $stmt->execute([$getCookie->sub]);
        $result = $stmt->fetch();
        $response->getBody()->write(json_encode($result));
    });

    //Confirma Saque
    $app->post('/', function (Request $request, Response $response, array $args) {

        $getCookie = GetToken::tokenArray($request)->nam;
        $getCookie2 = GetToken::tokenArray($request)->sub;
        $postData = $request->getParsedBody();
        $today = date('Y-m-d');
        $stmtd = $this->db->prepare("SELECT date_birth,company,titular_bank,saque_free,agency,acc FROM users WHERE user_id = ? ");
        $stmtd->execute([$getCookie2]);
        $resultd = $stmtd->fetch();
        //if (validaCPF($resultd['company']) == true) {
        //    if ($resultd['company'] == '') {
        //        $response->getBody()->write(json_encode(["error" => true, "message" => "CPF obrigatório para solicitar saque!"]));
        //    } else {
        // if ($resultd['titular_bank'] == '') {
        //     $response->getBody()->write(json_encode(["error" => true, "message" => "Nome titular obrigatório para solicitar saque!"]));
        // } else {
        //     if ($resultd['agency'] == '' || $resultd['acc'] == '') {
        //         $response->getBody()->write(json_encode(["error" => true, "message" => "Agência e Conta obrigatório para solicitar saque!"]));
        //     } else {
        //         if ($resultd['date_birth'] == '') {
        //             $response->getBody()->write(json_encode(["error" => true, "message" => "Data de nascimento obrigatório para solicitar saque!"]));
        //         } else {
        $stmts = $this->db->prepare("SELECT transaction_id,time FROM `transactions` WHERE sender = ? and type = 2 and status in (1,2) and status in (1,7)");
        $stmts->execute([$getCookie]);
        $totals = $stmts->rowCount();
        if ($totals > 0) {
            $response->getBody()->write(json_encode(["error" => true, "message" => "Permitido saque somente quando o ultimo pedido for Finalizado!"]));
        } else {
            $stmtv = $this->db->prepare("SELECT transaction_id,time FROM `transactions` WHERE sender = ? and type = 2 and status in (1,2,7) and cast(time as date) = ? ");
            $stmtv->execute([$getCookie, $today]);
            $totalv = $stmtv->rowCount();
            if ($totalv > 0 && $resultd['saque_free'] == 0) {
                $response->getBody()->write(json_encode(["error" => true, "message" => "Permitido um saque por dia!"]));
            } else {
                $stmty = $this->db->prepare("SELECT debit_premio,bank,debit_base FROM users where user_id = ? ");
                $stmty->execute([$getCookie2]);
                $result = $stmty->fetch();
                $postData['name'] = $getCookie;
                $postData[] = date("Y-m-d H:i:s");
                $postData[] = getenv("REMOTE_ADDR");

                if ($result['debit_premio'] < $postData['sum']) {
                    $response->getBody()->write(json_encode(["error" => true, "message" => "Valor inserido maior que o Saldo!"]));
                } else if ($result['bank'] == '' || $result['bank'] == null) {
                    $response->getBody()->write(json_encode(["error" => true, "message" => "Dados Bancários não cadastrados!"]));
                } else {
                    try {
                        $valor_final = $result['debit_premio'] - $postData['sum'];
                        $postData[]  = $valor_final + $result['debit_base'];

                        $postData2[] = $valor_final;
                        $postData2[] = $getCookie2;
                        $stmt = $this->db->prepare("INSERT into transactions (type,receiver,status,amount,pix_choice,sender,time,ip_address,saldo) values('2','BPremiado','1',?,?,?,?,?,?)");
                        $stmt->execute(array_values($postData));
                        $stmtx = $this->db->prepare("UPDATE users set debit_premio = ? where user_id = ?");
                        $stmtx->execute(array_values($postData2));
                        $response->getBody()->write(json_encode(["error" => false]));
                    } catch (PDOException $e) {
                        $response->getBody()->write(json_encode(["error" => true, "message" => "Ocorreu um erro interno!"]));
                    }
                }
            }
        }
        //                 }
        //             }
        //         }
        //     }
        // } 
        // else {
        //     $response->getBody()->write(json_encode(["error" => true, "message" => "CPF inválido,entre em contato com um atendente!"]));
        // }
    });
    


    //Confirma Deposito
    $app->put('/deposit', function (Request $request, Response $response, array $args) {
        $getCookie = GetToken::tokenArray($request)->nam;
        $getCookie2 = GetToken::tokenArray($request)->sub;
        // $cpf = GetToken::tokenArray($request)->cpf;
        $postData = $request->getParsedBody();
        // $stmtd = $this->db->prepare("SELECT company FROM users WHERE user_id = ? ");
        // $stmtd->execute([$getCookie2]);
        // $resultd = $stmtd->fetch();
        // $cpf = $resultd['company'];
        $stmty = $this->db->prepare("SELECT debit_premio,debit_base FROM users where user_id = ? ");
        $stmty->execute([$getCookie2]);
        $result = $stmty->fetch();
        $postData['name'] = $getCookie;
        $postData[] = date("Y-m-d H:i:s");
        $postData[] = getenv("REMOTE_ADDR");
        $stmtt = $this->db->prepare("SELECT  receiver FROM transactions WHERE sender = ? AND type = 1 AND status = 1");
        $stmtt->execute([$getCookie]);
        $resultt = $stmtt->fetch();
        // if (validaCPF($cpf) == true) {
        if ($resultt['receiver'] == '') {
            if ($postData['name'] != '') {
                try {
                    $valor_final = $result['debit_premio'] + $result['debit_base'];
                    $postData[]  = $valor_final;
                    $postData['bnome'] = 'Banco ' . $postData['bnome'];
                    $stmt = $this->db->prepare("INSERT into transactions (type,status,amount,receiver,sender,time,ip_address,saldo) values('1','1',?,?,?,?,?,?)");
                    $stmt->execute(array_values($postData));
                    // var_dump($stmt);
                    $response->getBody()->write(json_encode(["error" => false]));
                } catch (Exeption $e) {
                    $response->getBody()->write(json_encode(["error" => true, "message" => "Ocorreu um erro interno!"]));
                }
            } else {
                $response->getBody()->write(json_encode(["error" => true, "message" => "Ocorreu um erro interno!"]));
            }
        } else {
            $response->getBody()->write(json_encode(["error" => true, "message" => "Pedido ja solicitado!"]));
        }
        // } else {
        //     $response->getBody()->write(json_encode(["error" => true, "message" => "CPF obrigatório para solicitar deposito!"]));
        // }
    });

    //Confirma transferencia 
    $app->post('/credit', function (Request $request, Response $response, array $args) {
        $getCookie = GetToken::tokenArray($request)->nam;
        $getCookie2 = GetToken::tokenArray($request)->sub;
        $postData = $request->getParsedBody();
        $stmty = $this->db->prepare("SELECT debit_premio,debit_base FROM users where user_id = ? ");
        $stmty->execute([$getCookie2]);
        $result = $stmty->fetch();
        $postData['name'] = $getCookie;
        $postData[] = date("Y-m-d H:i:s");
        $postData[] = getenv("REMOTE_ADDR");
        //Verifica o receiver
        $stmtx = $this->db->prepare("SELECT debit_premio,debit_base,username,user_id FROM users where username = ? ");
        $stmtx->execute([$postData['bnome']]);
        $resultx = $stmtx->fetch();
        //Verifica a comissao
        $stmty2 = $this->db->prepare("SELECT comissao FROM managers where user_id = ? ");
        $stmty2->execute([$resultx['user_id']]);
        $resulty2 = $stmty2->fetch();
        if ($postData['amount'] <= $result['debit_base']) {
            if ($resultx['username'] != '' && $postData['bnome'] != $postData['name']) {
                if ($postData['name'] != '') {
                    try {
                        $amount = $postData['amount'];
                        $postData[]  = $amount;
                        if ($getCookie == 'Gerente_Stars') {
                            $comissao = $resulty2['comissao'];
                            $postData[]  = $comissao;
                            $stmt = $this->db->prepare("INSERT into transactions (type,status,amount,receiver,sender,time,ip_address,saldo,comissao) values('3','2',?,?,?,?,?,?,?)");
                            $stmt->execute(array_values($postData));
                        } else {
                            $stmt = $this->db->prepare("INSERT into transactions (type,status,amount,receiver,sender,time,ip_address,saldo) values('3','2',?,?,?,?,?,?)");
                            $stmt->execute(array_values($postData));
                        }
                        $stmt1 = $this->db->prepare("UPDATE users set debit_base = (debit_base - ?) WHERE username = ?");
                        $stmt1->execute([$postData['amount'], $postData['name']]);
                        $stmt2 = $this->db->prepare("UPDATE users set debit_base = (debit_base + ?) WHERE username = ?");
                        $stmt2->execute([$postData['amount'], $postData['bnome']]);
                        $response->getBody()->write(json_encode(["error" => false]));
                    } catch (Exeption $e) {
                        $response->getBody()->write(json_encode(["error" => true, "message" => "Ocorreu um erro interno!"]));
                    }
                } else {
                    $response->getBody()->write(json_encode(["error" => true, "message" => "Ocorreu um erro interno!"]));
                }
            } else {
                $response->getBody()->write(json_encode(["error" => true, "message" => "Username não encontrado!"]));
            }
        } else {
            $response->getBody()->write(json_encode(["error" => true, "message" => "Saldo insuficiente!"]));
        }
    });

    //Confirma transferencia2
    $app->post('/managermov', function (Request $request, Response $response, array $args) {
        $getCookie = GetToken::tokenArray($request)->nam;
        $getCookie2 = GetToken::tokenArray($request)->sub;
        $postData = $request->getParsedBody();
        $stmty = $this->db->prepare("SELECT debit_premio FROM users where user_id = ? ");
        $stmty->execute([$getCookie2]);
        $result = $stmty->fetch();
        $postData['name'] = $getCookie;
        $postData[] = date("Y-m-d H:i:s");
        $postData[] = getenv("REMOTE_ADDR");
        //Verifica o receiver
        $stmtx = $this->db->prepare("SELECT debit_premio,debit_base,username,user_id,indication_id FROM users where username = ? and indication_id = ?");
        $stmtx->execute([$postData['bnome'], $getCookie2]);
        $resultx = $stmtx->fetch();
        if ($resultx != '') {
            if ($postData['amount'] <= $result['debit_premio']) {
                if ($resultx['username'] != '' && $postData['bnome'] != $postData['name']) {
                    if ($postData['name'] != '') {
                        try {
                            $amount_sender = $result['debit_premio'] - $postData['amount'];
                            $postData[]  = $amount_sender;
                            $amount_receiver = $resultx['debit_premio'] + $resultx['debit_base'] + $postData['amount'];
                            $postData[]  = $amount_receiver;
                            $stmt = $this->db->prepare("INSERT into transactions (type,status,amount,receiver,sender,time,ip_address,saldo_sender,saldo_receiver) values('3','2',?,?,?,?,?,?,?)");
                            $stmt->execute(array_values($postData));
                            $stmt1 = $this->db->prepare("UPDATE users set debit_premio = (debit_premio - ?) WHERE username = ?");
                            $stmt1->execute([$postData['amount'], $postData['name']]);
                            $stmt2 = $this->db->prepare("UPDATE users set debit_base = (debit_base + ?) WHERE username = ?");
                            $stmt2->execute([$postData['amount'], $postData['bnome']]);
                            $response->getBody()->write(json_encode(["error" => false]));
                        } catch (Exeption $e) {
                            $response->getBody()->write(json_encode(["error" => true, "message" => "Ocorreu um erro interno!"]));
                        }
                    } else {
                        $response->getBody()->write(json_encode(["error" => true, "message" => "Ocorreu um erro interno!"]));
                    }
                } else {
                    $response->getBody()->write(json_encode(["error" => true, "message" => "Username não encontrado!"]));
                }
            } else {
                $response->getBody()->write(json_encode(["error" => true, "message" => "Saldo insuficiente!"]));
            }
        } else {
            $response->getBody()->write(json_encode(["error" => true, "message" => "Usuário não pertence a sua Gerencia!"]));
        }
    });

    //Confirma transferencia Saque
    $app->post('/managersaq', function (Request $request, Response $response, array $args) {
        $getCookie = GetToken::tokenArray($request)->nam;
        $getCookie2 = GetToken::tokenArray($request)->sub;
        $postData = $request->getParsedBody();
        // $stmty = $this->db->prepare("SELECT debit_premio,debit_base,limit_amount FROM users where user_id = ? ");
        // $stmty->execute([$getCookie2]);
        // $result = $stmty->fetch();
        $postData['name'] = $getCookie;
        $postData[] = date("Y-m-d H:i:s");
        $postData[] = date("Y-m-d H:i:s");
        $postData[] = getenv("REMOTE_ADDR");
        // //Verifica o limite
        // $stmtz = $this->db->prepare("SELECT gerente FROM users where username = ? ");
        // $stmtz->execute([$postData['bnome']]);
        // $resultz = $stmtz->fetch();
        //Verifica o receiver
        $stmtx = $this->db->prepare("SELECT debit_premio,debit_base,username FROM users where username = ? ");
        $stmtx->execute([$postData['bnome']]);
        $resultx = $stmtx->fetch();
        if ($postData['amount'] <= $resultx['debit_premio']) {
            if ($resultx['username'] != '' && $postData['bnome'] != $postData['name']) {
                if ($postData['name'] != '') {
                    try {
                        $amount = $postData['amount'];
                        $postData[]  = $amount;
                        $stmt = $this->db->prepare("INSERT into transactions (type,status,amount,receiver,sender,time,updated_at,ip_address,saldo) values('2','2',?,?,?,?,?,?,?)");
                        $stmt->execute(array_values($postData));
                        $stmt1 = $this->db->prepare("UPDATE users set debit_base = (debit_base + ?) WHERE username = ?");
                        $stmt1->execute([$postData['amount'], $postData['name']]);
                        $stmt2 = $this->db->prepare("UPDATE users set debit_premio = (debit_premio - ?) WHERE username = ?");
                        $stmt2->execute([$postData['amount'], $postData['bnome']]);
                        $response->getBody()->write(json_encode(["error" => false]));
                    } catch (Exeption $e) {
                        $response->getBody()->write(json_encode(["error" => true, "message" => "Ocorreu um erro interno!"]));
                    }
                } else {
                    $response->getBody()->write(json_encode(["error" => true, "message" => "Ocorreu um erro interno!"]));
                }
            } else {
                $response->getBody()->write(json_encode(["error" => true, "message" => "Username não encontrado!"]));
            }
        } else {
            $response->getBody()->write(json_encode(["error" => true, "message" => "Saldo insuficiente!"]));
        }
    });


    //Mostrar Quantidade
    $app->post('/centavos', function (Request $request, Response $response, array $args) {
        $postData = $request->getParsedBody();
        $dataNow = date("Y-m-d");
        $postData[] = '%' . $dataNow . '%';
        $stmt = $this->db->prepare("SELECT count(amount) as qtd FROM `transactions` where TRUNCATE(amount,0) = TRUNCATE(?,0) and type = 1 and time like ? AND (status = 1 OR status = 2) ORDER BY `transaction_id` DESC");
        $stmt->execute(array_values($postData));
        $result = $stmt->fetch();
        $response->getBody()->write(json_encode($result));
    });

    //Atualizar dados do Banco 
    $app->put('/att', function (Request $request, Response $response, array $args) {
        $getCookie = GetToken::tokenArray($request)->sub;
        $postData = $request->getParsedBody();
        $postData['user_id'] = $getCookie;
        $stmt = $this->db->prepare("SELECT company FROM users WHERE user_id = ?");
        $stmt->execute([$postData['user_id']]);
        $result = $stmt->fetch();
        if ($result['company'] == '') {
            //verfica se existe aquele CPF
            $stmt2 = $this->db->prepare("SELECT company FROM users WHERE company = ?");
            $stmt2->execute([$postData['cpf']]);
            $result2 = $stmt2->fetch();
            if ($postData['cpf'] == $result2['company']) {
                $response->getBody()->write(json_encode(["error" => true, "message" => "CPF já cadastrado."]));
            } else {
                if (
                    $postData['type_acc'] != '' and $postData['bank'] != '' and $postData['agency'] != '' and $postData['acc'] != '' and
                    $postData['cpf'] != '' and  $postData['titular'] != ''
                ) {
                    $stmt = $this->db->prepare("UPDATE users set type_acc = ?,bank = ?,agency = ?, acc = ?,
                        company = ?,titular_bank = Upper(?), acoper = ?, date_birth = ? WHERE user_id = ?");
                    $stmt->execute(array_values($postData));
                    $response->getBody()->write(json_encode(["error" => false]));
                } else {
                    $response->getBody()->write(json_encode(["error" => true, "message" => "Erro dados não registrados."]));
                }
            }
        } else if ($result['company'] != '') {
            if (
                $postData['type_acc'] != '' and $postData['bank'] != '' and $postData['agency'] != '' and $postData['acc'] != '' and
                $postData['cpf'] != '' and  $postData['titular'] != ''
            ) {
                $stmt = $this->db->prepare("UPDATE users set type_acc = ?,bank = ?,agency = ?, acc = ?,
                    company = ?,titular_bank = Upper(?), acoper = ?, date_birth = ? WHERE user_id = ?");
                $stmt->execute(array_values($postData));
                $response->getBody()->write(json_encode(["error" => false]));
            } else {
                $response->getBody()->write(json_encode(["error" => true, "message" => "Erro dados não registrados."]));
            }
        }
    });


    $app->get('/confirmdeposit', function (Request $request, Response $response, array $args) {
        $stmt = $this->db->prepare("SELECT amount as info_amount_ajax, receiver as info_receiver_ajax , transaction_id as info_transaction_id_ajax,qrcode as info_qrcode_ajax,copiacola as info_copiacola_ajax FROM transactions WHERE sender = ? AND type = 1 AND status = 1");
        $stmt->execute([GetToken::tokenArray($request)->nam]);
        $result = $stmt->fetch();
        $amount = $result["info_amount_ajax"];
        $stmt2 = $this->db->prepare("SELECT bank_id as identificacao_banco_ajax, img as imagem_ajax, descricao as descricao_banco_ajax, ag as ag_ajax, cc as cc_ajax, valor as valor_banco_ajax FROM adm_bank WHERE status in(1,3,4) order by ordem_bank asc");
        $stmt2->execute();
        $result2 = $stmt2->fetchAll();
        $stmt3 = $this->db->prepare("SELECT bank_id as identificacao_banco_ajax, img as imagem_ajax, descricao as descricao_banco_ajax, ag as ag_ajax, cc as cc_ajax, valor as valor_banco_ajax FROM adm_bank WHERE valor = ?");
        $pieces = explode("Banco ", $result['info_receiver_ajax']);
        $stmt3->execute([$pieces[1]]);
        $result3 = $stmt3->fetch();
        $stmta = $this->db->prepare("SELECT * FROM `cards` WHERE user_id = ?");
        $stmta->execute([GetToken::tokenArray($request)->sub]);
        $resulta = $stmta->fetch();
        if ($result != null) {
            $result["info_amount_ajax"] = number_format($result["info_amount_ajax"], 2, ',', '.');
            $response->getBody()->write(json_encode(["deposit" => true, "info" => $result, "card" => $resulta, "amount" => $amount, "bank" => $result3]));
        } else {
            $response->getBody()->write(json_encode(["deposit" => false, "bank" => $result2]));
        }
    });

    $app->get('/cancel', function (Request $request, Response $response, array $args) {
        $stmt = $this->db->prepare("UPDATE transactions SET status = 6 WHERE sender = ? AND type = 1 AND status = 1");
        $stmt->execute([GetToken::tokenArray($request)->nam]);
        if ($stmt) {
            $response->getBody()->write(json_encode(["error" => false]));
        } else {
            $response->getBody()->write(json_encode(["error" => true, "message" => "Pedido de depósito não encontrado."]));
        }
    });

    $app->get('/cancel/withdraw/{id}', function (Request $request, Response $response, array $args) {
        $stmt = $this->db->prepare("SELECT amount,status FROM transactions WHERE receiver = ? AND transaction_id = ? AND type = 2 AND status = 1");
        $stmt->execute([GetToken::tokenArray($request)->nam, $args['id']]);
        $result = $stmt->fetch(PDO::FETCH_OBJ);
        if ($result->status == 1) {
            if ($result != null) {
                $query = $this->db->prepare("UPDATE transactions SET status = 6 WHERE sender = ? AND transaction_id = ? AND type = 2 AND status = 1");
                $query->execute([GetToken::tokenArray($request)->nam, $args['id']]);

                $query = $this->db->prepare("UPDATE users SET debit_premio = (debit_premio + ?) WHERE user_id = ?");
                $query->execute([$result->amount, GetToken::tokenArray($request)->sub]);

                $response->getBody()->write(json_encode(["error" => false]));
            }
        } else {
            $response->getBody()->write(json_encode(["error" => true, "message" => "Permitido estorno somente de pedidos pendentes."]));
        }
    });

    $app->get('/withdraw', function (Request $request, Response $response, array $args) {
        $stmt = $this->db->prepare("SELECT transaction_id AS id, amount,status, time FROM transactions WHERE sender = ? AND type = 2 AND status in (1,7)");
        $stmt->execute([GetToken::tokenArray($request)->nam]);
        $response->getBody()->write(json_encode($stmt->fetchAll()));
    });

    $app->post('/pagseguro', function (Request $request, Response $response, array $args) {
        $postData = $request->getParsedBody();
        $getCookie = GetToken::tokenArray($request)->nam;
        $stmt = $this->db->prepare("SELECT transaction_id FROM `transactions` where type = 1 and sender =  ? and receiver = 'Banco PagSeguro'  
        ORDER BY transaction_id  DESC LIMIT 1");
        $stmt->execute([$getCookie]);
        $result = $stmt->fetch();
        $amount = $postData['value'] . '.' . $postData['cents'];
        // $data['token'] = '2d3da50e-334f-4eda-b9af-1ddd51778ce946d818e3486586f645648f278b3456739c90-688a-44f1-bdcc-9817d3e37886';
        // $data['email'] = 'comercialmunhozdafonseca@gmail.com';
        $data['token'] = '220b7898-8a1d-4bfb-baa5-cb6ab5a0046441fda8b54ab1b7f8ff11b3db3be8c96bd88f-0b86-4275-96cf-691dbc8dd321';  //Edu token
        $data['email'] = 'eduardodesena277@gmail.com';  //Edu email
        $data['currency'] = 'BRL';
        $data['itemId1'] = '1';
        $data['itemQuantity1'] = '1';
        $data['itemDescription1'] = $result['transaction_id'];
        $data['itemAmount1'] = $amount;

        $url = 'https://ws.pagseguro.uol.com.br/v2/checkout';

        $data = http_build_query($data);

        $curl = curl_init($url);

        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
        curl_setopt($curl, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
        $xml = curl_exec($curl);

        curl_close($curl);

        $xml = simplexml_load_string($xml);
        $response->getBody()->write($xml->code);
    });

    $app->post('/mercadopago', function (Request $request, Response $response, array $args) {
        $postData = $request->getParsedBody();
        $getCookie = GetToken::tokenArray($request)->nam;
        $stmt = $this->db->prepare("SELECT transaction_id FROM `transactions` where type = 1 and sender = ? and receiver = 'Banco Mercado Pago'  
        ORDER BY transaction_id DESC LIMIT 1");
        $stmt->execute([$getCookie]);
        $result = $stmt->fetch();

        // $amount = $postData['value'] . '.' . $postData['cents'];
        $amount = $postData['value'];
        // SDK de Mercado Pago
        include("../../vendor/autoload.php");

        // Configura credenciais
        MercadoPago\SDK::setAccessToken('APP_USR-8088456178822735-072311-873a41c1e7d12b06a098c72c23e67e89-1164100777');


        // Cria um objeto de preferência
        $preference = new MercadoPago\Preference();

        // Cria um item na preferência
        $item = new MercadoPago\Item();
        $item->title = $result['transaction_id'];
        $item->quantity = 1;
        $item->unit_price = $amount;
        $preference->external_reference = $result['transaction_id'];
        $preference->items = array($item);
        $preference->notification_url = "https://bichopremiado.com/restrito/mercadopago/receiver.php";
        $preference->save();

        $response->getBody()->write($preference->init_point);
    });

    $app->post('/fitbank', function (Request $request, Response $response, array $args) {

        $postData = $request->getParsedBody();
        $getCookie = GetToken::tokenArray($request)->nam;
        $getCookieCompany = GetToken::tokenArray($request)->cpf;
        $getCookieId = GetToken::tokenArray($request)->sub;
        $stmt = $this->db->prepare("SELECT transaction_id, amount FROM `transactions` 
                WHERE type = 1 and sender = ? and receiver = 'Banco Pix Fit Bank' 
                ORDER BY transaction_id  
                DESC LIMIT 1");
        $stmt->execute([$getCookie]);
        $result = $stmt->fetch();

        if ($getCookieCompany == '') {
            $stmt = $this->db->prepare("UPDATE users SET company = ? WHERE username = ?");
            $stmt->execute([$postData['company'], $getCookie]);
        }

        $amount = $result['amount'];
        $transaction_id = $result['transaction_id'];

        $hoje = Date('Y/m/d');
        $validadeQr = date('Y/m/d', strtotime('+1 days'));

        $data = '{
            "Method": "GenerateDynamicPixQRCode",
            "PartnerId": 1126,
            "BusinessUnitId": 438,
            "PixKey": "1201d66e-9171-4654-a595-4c3c2dbc8036",
            "TaxNumber": "47953984000199",
            "Bank": "450",
            "BankBranch": "0001",
            "BankAccount": "744567787",
            "BankAccountDigit": "4",
            "payerTaxNumber": "' . $postData['company'] . '",
            "payerName": "Pagador",
            "ChangeType": 0,
            "reusable": false,
            "PrincipalValue": ' . $amount . ',
            "additionalData": [{
                "Name": "' . $getCookie . '",
                "Value": "' . $amount . '"
            }],
            "payerRequest": "string",
            "ExpirationDate": "' . $validadeQr . '",
            "TransactionPurpose": 0,
            "TransactionValue": 0,
            "TransactionChangeType": 0,
            "AgentModality": 2,
            "Address": {
                "AddressLine": "Ruawerwrew A",
                "AddressLine2": "Rua B",
                "Neighborhood": "string",
                "ZipCode": "60540374",
                "CityName": "Fortaleza",
                "AddressType": 0,
                "CityCode": "345",
                "State": "Ceara",
                "Country": "Brasil",
                "Complement": "complement"
            }
        }';




        $curlQrCode = curl_init();
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => "https://apiv2.fitbank.com.br/main/execute",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => $data,
            CURLOPT_COOKIE => "AWSALBTG=07eOoS91vSFrVSZwLqElCX30gHT0szI10bruwSOuYr8OcnYhL6%2Fdgk7AFY2ZXygHcI9A%2F9VIJ31G%2FDIrtYUWpKCN1W2ir%2FO3NEqemAG9s9YYFLJ6XhhMrEqMQbD4mRLduohOqjnnOUXB02EAOcj%2BbvQO4EZS4L%2BZBgPeelkF5pcQ; AWSALBTGCORS=07eOoS91vSFrVSZwLqElCX30gHT0szI10bruwSOuYr8OcnYhL6%2Fdgk7AFY2ZXygHcI9A%2F9VIJ31G%2FDIrtYUWpKCN1W2ir%2FO3NEqemAG9s9YYFLJ6XhhMrEqMQbD4mRLduohOqjnnOUXB02EAOcj%2BbvQO4EZS4L%2BZBgPeelkF5pcQ",
            CURLOPT_HTTPHEADER => [
                "Authorization: Basic ZjIxNzI3MzUtNTRlYy00NjgyLWI3NTAtZjczN2QxY2RiMWEyOmI1OTk5NjFjLWQ5NWYtNDBjZi1iNWUxLThmM2JhNGIxOWMxMA==",
                "Content-Type: application/json"
            ],
        ]);

        $responseApi = curl_exec($curl);
        // print_r($responseApi);
        $err = curl_error($curl);

        curl_close($curl);

        if ($responseApi) {
            $decodedData = json_decode($responseApi, true);
            $documentNumber = $decodedData['DocumentNumber'];

            if ($documentNumber) {
                $dataQr = json_encode(array(
                    "Method" => "GetPixQRCodeById",
                    "PartnerId" => "1126",
                    "BusinessUnitId" => 438,
                    "TaxNumber" =>  47953984000199,
                    "DocumentNumber" => $documentNumber
                ));

                sleep(25);
                curl_setopt_array($curlQrCode, [
                    CURLOPT_URL => "https://apiv2.fitbank.com.br/main/execute",
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => "",
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 30,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => "POST",
                    CURLOPT_POSTFIELDS => $dataQr,
                    CURLOPT_COOKIE => "AWSALBTG=TmbUwdr30I%2B1ibirV7QcpD6VSEGmTsD2738QrO7flz66RCV4alSPU6zQp1F9e3E52EsRBFxhF6%2FtFE89wlxnErSnJbja9gaNW5TN%2BnrJFraqcwmlOAcwjwOVfzJdTSFROU%2FFYGSfo4DyY4WYOWzSSI5QTszZmtXClfGUs4%2Bm2FkO; AWSALBTGCORS=TmbUwdr30I%2B1ibirV7QcpD6VSEGmTsD2738QrO7flz66RCV4alSPU6zQp1F9e3E52EsRBFxhF6%2FtFE89wlxnErSnJbja9gaNW5TN%2BnrJFraqcwmlOAcwjwOVfzJdTSFROU%2FFYGSfo4DyY4WYOWzSSI5QTszZmtXClfGUs4%2Bm2FkO",
                    CURLOPT_HTTPHEADER => [
                        "Authorization: Basic ZjIxNzI3MzUtNTRlYy00NjgyLWI3NTAtZjczN2QxY2RiMWEyOmI1OTk5NjFjLWQ5NWYtNDBjZi1iNWUxLThmM2JhNGIxOWMxMA==",
                        "Content-Type: application/json"
                    ],
                ]);

                $responseQrCode = curl_exec($curlQrCode);
                // print_r($responseQrCode);
                $errQrCode = curl_error($curlQrCode);
                curl_close($curlQrCode);

                if ($errQrCode) {
                    $response->getBody()->write(json_encode(["error" => true, "message" => "erro"]));
                } else {
                    $qrCodeDecode = json_decode($responseQrCode, true);
                    $qrCodeDecode = $qrCodeDecode['GetPixQRCodeByIdInfo'];
                    $qrCodeDecode['HashCode'] =  base64_decode($qrCodeDecode['HashCode']);

                    $stmt = $this->db->prepare("UPDATE transactions set qrcode = ?, copiacola = ?, code_identify = ? where transaction_id = ?");

                    $stmt->execute([$qrCodeDecode['QRCodeBase64'], $qrCodeDecode['HashCode'], $documentNumber, $transaction_id]);

                    $response->getBody()->write(json_encode($qrCodeDecode));
                }
            }
        } else {
            $response->getBody()->write(json_encode(["error" => true, "message" => "erro"]));
        }
    });

    $app->post('/bankrb', function (Request $request, Response $response, array $args) {

        $postData = $request->getParsedBody();
        $getCookie = GetToken::tokenArray($request)->nam;
        $getCookieCompany = GetToken::tokenArray($request)->cpf;
        $getCookieId = GetToken::tokenArray($request)->sub;
        $stmt = $this->db->prepare("SELECT transaction_id, amount FROM `transactions` 
                WHERE type = 1 and sender = ? and receiver = 'Banco Pix RB' 
                ORDER BY transaction_id  
                DESC LIMIT 1");
        $stmt->execute([$getCookie]);
        $result = $stmt->fetch();

        if ($getCookieCompany == '') {
            $stmt = $this->db->prepare("UPDATE users SET company = ? WHERE username = ?");
            $stmt->execute([$postData['company'], $getCookie]);
        }

        // CONFIG FITBANK
        // $partnerId  = 1230;
        // $businessUnitId = 1301;
        // $pixKey = "8ade2b19-b322-4fce-8773-bc1a5ab9df78";
        // $taxNumber = "47953984000199";
        // $bank =  "450";
        // $bankBranch = "0001";
        // $bankAccount = "898678564";
        // $bankAccountDigit = "8";


        $amount = $result['amount'];
        $transaction_id = $result['transaction_id'];

        $hoje = Date('Y/m/d');
        $validadeQr = date('Y/m/d', strtotime('+1 days'));
        $company = preg_replace("/[^\d]/", "", $postData['company']);
        $data = '{
            "Method": "GenerateDynamicPixQRCode",
            "PartnerId": 1230,
            "BusinessUnitId": 1301,
            "PixKey": "2e96e8cc-4f57-48a6-8513-33cacbbd457b",
            "TaxNumber": "46871247000184",
            "Bank": "450",
            "BankBranch": "0001",
            "BankAccount": "931872844",
            "BankAccountDigit": "7",
            "payerTaxNumber": "' . $company . '",
            "payerName": "Pagador",
            "ChangeType": 0,
            "reusable": false,
            "PrincipalValue": ' . $amount . ',
            "additionalData": [{
                "Name": "' . $getCookie . '",
                "Value": "' . $amount . '"
            }],
            "payerRequest": "string",
            "ExpirationDate": "' . $validadeQr . '",
            "TransactionPurpose": 0,
            "TransactionValue": 0,
            "TransactionChangeType": 0,
            "AgentModality": 2,
            "Address": {
                "AddressLine": "Ruawerwrew A",
                "AddressLine2": "Rua B",
                "Neighborhood": "string",
                "ZipCode": "60540374",
                "CityName": "Fortaleza",
                "AddressType": 0,
                "CityCode": "345",
                "State": "Ceara",
                "Country": "Brasil",
                "Complement": "complement"
            }
        }';


        $curlQrCode = curl_init();
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => "https://apiv2.fitbank.com.br/main/execute",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS => $data,
            CURLOPT_HTTPHEADER => [
                "Authorization: Basic MzJiZGY3OGQtMDIzNC00MjI3LTkwNDItMzBlYWVhMzUzYzJkOjIwNmVmNjRmLTIyOWItNDBhOS05MTBjLTMyMWUxYWYwNzZiYQ==",
                "Content-Type: application/json"
            ],
        ]);

        $responseApi = curl_exec($curl);
        // print_r($responseApi);
        $err = curl_error($curl);
        // $response->getBody()->write(json_encode(["error" => true, "message" => $responseApi]));

        curl_close($curl);

        if ($responseApi) {
            $decodedData = json_decode($responseApi, true);
            $documentNumber = $decodedData['DocumentNumber'];

            if ($documentNumber) {
                $dataQr = json_encode(array(
                    "Method" => "GetPixQRCodeById",
                    "PartnerId" => 1230,
                    "BusinessUnitId" => 1301,
                    "TaxNumber" =>  "46871247000184",
                    "DocumentNumber" => $documentNumber
                ));

                sleep(15);
                curl_setopt_array($curlQrCode, [
                    CURLOPT_URL => "https://apiv2.fitbank.com.br/main/execute",
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => "",
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 30,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => "POST",
                    CURLOPT_POSTFIELDS => $dataQr,
                    CURLOPT_COOKIE => "AWSALBTG=TmbUwdr30I%2B1ibirV7QcpD6VSEGmTsD2738QrO7flz66RCV4alSPU6zQp1F9e3E52EsRBFxhF6%2FtFE89wlxnErSnJbja9gaNW5TN%2BnrJFraqcwmlOAcwjwOVfzJdTSFROU%2FFYGSfo4DyY4WYOWzSSI5QTszZmtXClfGUs4%2Bm2FkO; AWSALBTGCORS=TmbUwdr30I%2B1ibirV7QcpD6VSEGmTsD2738QrO7flz66RCV4alSPU6zQp1F9e3E52EsRBFxhF6%2FtFE89wlxnErSnJbja9gaNW5TN%2BnrJFraqcwmlOAcwjwOVfzJdTSFROU%2FFYGSfo4DyY4WYOWzSSI5QTszZmtXClfGUs4%2Bm2FkO",
                    CURLOPT_HTTPHEADER => [
                        "Authorization: Basic MzJiZGY3OGQtMDIzNC00MjI3LTkwNDItMzBlYWVhMzUzYzJkOjIwNmVmNjRmLTIyOWItNDBhOS05MTBjLTMyMWUxYWYwNzZiYQ==",
                        "Content-Type: application/json"
                    ],
                ]);

                $responseQrCode = curl_exec($curlQrCode);
                // print_r($responseQrCode);
                $errQrCode = curl_error($curlQrCode);
                curl_close($curlQrCode);

                if ($errQrCode) {
                    $response->getBody()->write(json_encode(["error" => true, "message" => "erro"]));
                } else {
                    $qrCodeDecode = json_decode($responseQrCode, true);
                    $qrCodeDecode = $qrCodeDecode['GetPixQRCodeByIdInfo'];
                    $qrCodeDecode['HashCode'] =  base64_decode($qrCodeDecode['HashCode']);

                    $stmt = $this->db->prepare("UPDATE transactions set qrcode = ?, copiacola = ?, code_identify = ? where transaction_id = ?");

                    $stmt->execute([$qrCodeDecode['QRCodeBase64'], $qrCodeDecode['HashCode'], $documentNumber, $transaction_id]);

                    $response->getBody()->write(json_encode($qrCodeDecode));
                }
            }
        } else {
            $response->getBody()->write(json_encode(["error" => true, "message" => "erro"]));
        }
    });

    $app->post('/rb', function (Request $request, Response $response, array $args) {

        try {
            // Ativar o modo de erro PDO para lançar exceções
            $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $postData = $request->getParsedBody();
            $getCookie = GetToken::tokenArray($request)->nam;
            $getCookieCompany = GetToken::tokenArray($request)->cpf;
            $getCookieId = GetToken::tokenArray($request)->sub;
            $stmt = $this->db->prepare("SELECT transaction_id, amount FROM `transactions` 
                    WHERE type = 1 and sender = ? and receiver = 'Banco Pix RB' 
                    ORDER BY transaction_id  
                    DESC LIMIT 1");
            $stmt->execute([$getCookie]);
            $result = $stmt->fetch();

            if ($getCookieCompany == '') {
                $stmt = $this->db->prepare("UPDATE users SET company = ? WHERE username = ?");
                $stmt->execute([$postData['company'], $getCookie]);
            }

            // APENAS PARA O BANCO RB
            $amount = round($result['amount'] * 100);

            $transaction_id = $result['transaction_id'];

            $data = '{
                "valor": ' . $amount . ',
                "description": "' . $transaction_id . '",
                "callback_url": "https://bichopremiado.com/restrito/api/receiverCHR.php"
            }';

            $dataAuth = array(
                "document" => "47953984000199",
                "password" => "imperio2023"
            );

            $tokenCurl = curl_init();

            curl_setopt_array($tokenCurl, [
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_URL => "https://banking.rbsolucoesdepagamentos.com.br/api/auth",
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => "",
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => "POST",
                CURLOPT_POSTFIELDS => json_encode($dataAuth),
                CURLOPT_COOKIE => "PHPSESSID=l7d9p22gstbomvh2tov8lgcios",
                CURLOPT_HTTPHEADER => [
                    "Authorization: Bearer b83216p370fc768d0a1b10a766d85858",
                    "Content-Type: application/json"
                ],
            ]);

            $responseToken = curl_exec($tokenCurl);
            $decodedDataToken = json_decode($responseToken, true);
            $token = $decodedDataToken['token'];
            curl_close($tokenCurl);

            if ($token) {
                $curl = curl_init();

                curl_setopt_array($curl, [
                    CURLOPT_SSL_VERIFYPEER => false,
                    CURLOPT_URL => "https://banking.rbsolucoesdepagamentos.com.br/api/pix/cobranca/criar",
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => "",
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 30,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => "POST",
                    CURLOPT_POSTFIELDS => $data,
                    CURLOPT_COOKIE => "PHPSESSID=l7d9p22gstbomvh2tov8lgcios",
                    CURLOPT_HTTPHEADER => [
                        "Authorization: Bearer $token",
                        "Content-Type: application/json"
                    ],
                ]);

                $responsePix = curl_exec($curl);
                $errPix = curl_error($curl);
                curl_close($curl);
                if ($errPix) {
                    $response->getBody()->write(json_encode(["error" => true, "message" => $errPix]));
                } else {
                    $pixDecoded = json_decode($responsePix, true);

                    // Obtém o conteúdo da imagem da URL
                    $imageContent = file_get_contents($pixDecoded['qrcode_url']);

                    // Converte o conteúdo da imagem em uma string base64
                    $base64Image = base64_encode($imageContent);

                    $copiacola = $pixDecoded['qrcode_digitable'];
                    $code_identify = $pixDecoded['id'];
                    $stmt = $this->db->prepare("UPDATE transactions set qrcode = ?, copiacola = ?, code_identify = ? where transaction_id = ?");

                    $stmt->execute([$base64Image, $copiacola, $code_identify, $transaction_id]);
                    $affectedRows = $stmt->rowCount();

                    if ($affectedRows > 0) {
                        $response->getBody()->write(json_encode(["error" => false, "message" => $copiacola]));
                    } else {
                        $response->getBody()->write(json_encode(["error" => true, "message" => "Nenhuma linha foi atualizada"]));
                    }
                }
            } else {
                $response->getBody()->write(json_encode(["error" => true, "message" => "erro"]));
            }
        } catch (PDOException $e) {
            $response->getBody()->write(json_encode(["error" => true, "message" => $e->getMessage()]));
        } catch (Exception $e) {
            $response->getBody()->write(json_encode(["error" => true, "message" => $e->getMessage()]));
        }
    });
    $app->get('/verifydeposit', function (Request $request, Response $response, array $args) {
        $getCookie = GetToken::tokenArray($request)->nam;
        $postData['name'] = $getCookie;
        $stmt = $this->db->prepare("SELECT a.transaction_id as transacao_ajax, b.file_name as file_name_ajax, a.receiver as receiver_ajax FROM `transactions` a
        left join archives b on a.transaction_id = b.transaction_id
        where a.sender = ?  AND a.type = 1 AND a.status = 1 ORDER BY a.transaction_id DESC");
        $stmt->execute([$postData['name']]);
        $result = $stmt->fetch();
        $response->getBody()->write(json_encode([$result, $getCookie]));
    });
})->add($checkSession);
