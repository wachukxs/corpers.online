<?php
$con = mysqli_connect("localhost", "connarts_ossai", "ossai'spassword", "connarts_nysc");

if (mysqli_query( $con, "SELECT email, password FROM login_details WHERE email = '".$_POST['email']."' AND password = '".$_POST['password']."' ")	) {
    if ( mysqli_affected_rows($con) == 1	) {

    #http_response_code(200);
    #good, success!
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ../account.php');
    exit();

    }	else {
        
      http_response_code(300);
      #there's no such details in our database, try with correct details !
      header('HTTP/1.1 301 Moved Permanently');
      header('Location: ../register.html');
      exit();

    }
  } else {

    #http_response_code(304);
    #the query didn't run. So pls try again!
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ../login.html');
    exit();
  }
?>