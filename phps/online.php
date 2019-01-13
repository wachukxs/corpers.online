<?php
#knows who logs in.
#konws when they log in.
#knows when they log out.
#knows how long they were logged in.
#know who makes searches, what kind of searches, and pages visited, clicks made and stuffs.
#REDUNDANT --- knows when they are online !   knows if they're logged in on not when they are online, !!!

session_start();
$con = mysqli_connect("localhost", "connarts_ossai", "ossai'spassword", "connarts_nysc");
$sql = "INSERT INTO sessions (session_id) VALUES ('" . session_id() . "') " ;
$query = mysqli_query( $con, $sql) ; 
if ( $query	) {
  #nice !
} else {
  $query ;
}