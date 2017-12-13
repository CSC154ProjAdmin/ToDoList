<?php
define('SQL_HOST','localhost');//database host
define('SQL_USER','root');//username
define('SQL_PASS','usbw');//password
define('SQL_DB','csc154_db');//database name

$conn = mysql_connect(SQL_HOST, SQL_USER, SQL_PASS)
  or die('Could not connect to the database; ' . mysql_error());

mysql_select_db(SQL_DB, $conn)
  or die('Could not select database; ' . mysql_error());
?>
