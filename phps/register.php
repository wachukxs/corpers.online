<?php
session_start();

$con = mysqli_connect("localhost", "connarts_ossai", "ossai'spassword", "connarts_nysc");

$selectSql = "SELECT email FROM login_details WHERE email = '".$_POST['email']."'";

$registerSql01 = "INSERT INTO login_details (password, email) VALUES ('".$_POST['password']."', '".$_POST['email']."') " ;
$registerSql02 = "INSERT INTO info (firstname, lastname, statecode) VALUES ('".$_POST['firstname']."', '".$_POST['lastname']."', '".$_POST['statecode']."') " ;

$_SESSION['email'] = $_POST['email'];

if (mysqli_query($con, $registerSql01) && mysqli_query($con, $registerSql02)	) {
  
  if (mysqli_num_rows($con, $selectSql) == 0 && mysqli_affected_rows($con) == 1) {

    #http_response_code(200);
    #good, success!
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ../account.html');
    exit();

  }	else {
        
    #http_response_code(300);
    #somebody else has the same email !, so nah
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ../register.html');
    exit();
  }

  } else {

    #http_response_code(304);
    #the query didn't run. So pls try again!
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ../register.html');
    exit();
  }
?>