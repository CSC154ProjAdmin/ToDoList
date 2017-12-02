<?php
define('SQL_HOST','xxxx');//database host
define('SQL_USER','xxxx');//username
define('SQL_PASS','xxxx');//password
define('SQL_DB','xxxx');//database name

$conn = mysql_connect(SQL_HOST, SQL_USER, SQL_PASS)
  or die('Could not connect to the database; ' . mysql_error());

mysql_select_db(SQL_DB, $conn)
  or die('Could not select database; ' . mysql_error());
?>
