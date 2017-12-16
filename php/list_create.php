<?php
include "db_connect.php";

header('Content-Type: application/json; charset=utf8');

if( !$conn) 
{
    die("ERROR: Cannot connect to database ".SQL_DB." on server ".SQL_HOST."
    using user name ".SQL_USER." (".mysqli_connect_errno().
    ", ".mysqli_connect_error().")");
}

$params = array();
$body = file_get_contents("php://input");
$body_params = json_decode($body);
if ($body_params) {
    foreach ($body_params as $param_name => $param_value) {
        $params[$param_name] = $param_value;
    }
}

$userQuery = <<<SQL
Insert Into Lists (UserID, sListName, dCreated, dUpdated)
Values ({$params["userID"]}, '{$params["listName"]}', sysdate(3), sysdate(3));
SQL;

$result = mysqli_query($conn, $userQuery);

if (!$result) {
    $data = '{"status":0}';
} else {
    $data = '{"newId":'.mysqli_insert_id($conn).'}';
}

mysqli_close($conn);   // close the connection

echo $data; // No json_encode neeeded here
?>
