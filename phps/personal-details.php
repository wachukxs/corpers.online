<?php
session_start();
ob_start();


$con = mysqli_connect("localhost", "connarts_ossai", "ossai'spassword", "connarts_nysc");

if (mysqli_query(
    $con, "SELECT username FROM details WHERE username = 
    '".$_POST['username']."' AND password = '".$_POST['password']."' "
    )	) {
    if ( mysqli_affected_rows($con) == 1	) {
      http_response_code(200);
    }	else {
      http_response_code(300);
    }
  } else {
    http_response_code(304);
  }

  
$sql = "UPDATE details SET phone_number='".$_POST['phone']."', location_s='".$_POST['location']."', fullname='".$_POST['name']."' WHERE email='".$_SESSION['email']."' ";

if (mysqli_query($conn, $sql)) {
    echo "Record updated successfully";
} else {
    echo "Error updating record: " . mysqli_error($conn);
}

mysqli_close($con);
?>