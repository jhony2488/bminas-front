<?php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

$app->get('/loginteste', function( Request $request, Response $response, array $args){

    $stmt = $this->db->query( "SELECT * FROM users WHERE username = 'caveira' ");  
      
    $response->getBody()->write(json_encode( $stmt->fetchAll(PDO::FETCH_OBJ) ));
    return $response;

});