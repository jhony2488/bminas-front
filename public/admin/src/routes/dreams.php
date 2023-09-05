<?php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Firebase\JWT\JWT;

$app->group('/dreams', function () use ($app, $verifica) {
    $app->get('/letra[/{letra}]', function (Request $request, Response $response, array $args) {
        $letra = $args['letra'];
        $stmt = $this->db->prepare("SELECT * FROM sonhos WHERE title like '" . $letra . "%'");
        $stmt->execute();
        $result = $stmt->fetchAll();
        
        $response->getBody()->write(json_encode($result));
        return $response;
    });
    $app->post('/word', function (Request $request, Response $response, array $args) {
        $postData = $request->getParsedBody();
        $stmt = $this->db->prepare("SELECT * FROM sonhos WHERE title = ?");
        $stmt->execute([$postData['palavra']]);
        $result = $stmt->fetchAll();
        $response->getBody()->write(json_encode($result));
        return $response;
    });
});