<?php
session_start();
setcookie("TestCookie", 'valuwewe', time()+3600);
echo session_id();
if (empty($_SESSION['count'])) {
   $_SESSION['count'] = 1;
} else {
   $_SESSION['count']++;
}
?>