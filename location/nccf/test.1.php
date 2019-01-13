<?php
header("Content-Type: application/json; charset=UTF-8");
$con = mysqli_connect("localhost", "connarts_ossai", "ossai'spassword", "connarts_nysc");

$sql = "SELECT places_data FROM places";
$result = mysqli_query($con, $sql);

if (mysqli_num_rows($result) > 0) {
    // output data of each row
    while($row = mysqli_fetch_assoc($result)) {
        var_dump($row["places_data"]);
        var_dump(json_decode($row["places_data"], true));
        echo "we got: " . $row["places_data"]. "<br>";
    }
}

$sql001 = "SELECT places_data FROM places";
                $result = mysqli_query($con, $sql001);
                if (mysqli_num_rows($result) > 0) {
                    // output data so we can update it.
                   echo 'ed-----';
                   var_dump (json_decode('{"type": "FeatureCollection","features": []}', true));
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
*/
/*
header("Content-Type: application/json; charset=UTF-8");
$obj = json_decode($_POST["x"], false);

$conn = new mysqli("myServer", "myUser", "myPassword", "Northwind");
$stmt = $conn->prepare("SELECT name FROM ? LIMIT ?");
$stmt->bind_param("ss", $obj->table, $obj->limit);
$stmt->execute();
$result = $stmt->get_result();
$outp = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($outp);
?>