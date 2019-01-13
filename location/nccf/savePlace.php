<?php
$con = mysqli_connect("localhost", "connarts_ossai", "ossai'spassword", "connarts_nysc");

$sql = 'SELECT places_data FROM places' ;

if ($result = mysqli_query($con, $sql)) {
    # code...
    $data = json_decode(mysqli_result($result, 0), true);

    #update data with by pushing new cordinates and input it back
    array_push($data['features'], file_get_contents('php://input'));

    #update the record in the db
    if (mysqli_query($con,'INSERT INTO places ( places_data ) VALUES ("'. $data .'")')){
        #respond ok, 200
    }
}