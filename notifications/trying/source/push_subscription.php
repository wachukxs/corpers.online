<?php
session_start();
$con = mysqli_connect("localhost","connarts_ossai","ossai'spassword","connarts_nysc");
$sub = file_get_contents('php://input');
$subscription = json_decode($sub, true);

if (!isset($subscription['endpoint'])) {
    echo 'Error: not a subscription';
    return;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        // create a new subscription entry in your database (endpoint is unique)
        $insertSQL = 'INSERT INTO endpoints ( the_endpint ) VALUES ("'. $sub .'")';
        break;
    case 'PUT':
        // update the key and token of subscription corresponding to the endpoint
        break;
    case 'DELETE':
        // delete the subscription corresponding to the endpoint
        break;
    default:
        echo "Error: method not handled";
        return;
}
