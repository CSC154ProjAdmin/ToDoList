<?php
session_start();
include "db_connect.php";

 // email and password sent from login form....change if needed
  $email = $_POST['sEmail'];
  $password = $_POST['sPassword'];

//you can change the 'users', 'email' or password values to whatever is needed
$sql="SELECT * FROM users WHERE sEmail='$email' and sPassword='$password'";
$result=mysql_query($sql);
 
// Mysql_num_row is counting table row
$count=mysql_num_rows($result);

// If result matched $email and $password, table row must be 1 row
if($count==1){
echo "You are now logged in.";
header('Refresh: 2; URL = members.php');//change members page to whatever the home page is
}
else {
echo "Wrong Username or Password";
header('Refresh: 4; URL = login.html');//change login page title if needed
}
?>
