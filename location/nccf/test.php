<?php
$con = mysqli_connect("localhost", "connarts_ossai", "ossai'spassword", "connarts_nysc");

if (mysqli_query($con,'INSERT INTO places ( test ) VALUES ("'.  $_POST['d'].'")')){
    #respond ok, 200
}
/*
#$json = file_get_contents($this->dog_data_JSON);
$json = file_get_contents($this->dog_data_JSON);
$this->dogs_array = json_decode($json,TRUE);
if ($this->dogs_array === null && json_last_error() !== JSON_ERROR_NONE)
{
throw new Exception("JSON error: " . json_last_error_msg());
}
$json = json_encode($this->dogs_array);
file_put_contents($this->dog_data_JSON,$json);
