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
Update tasks
SET isComplete = '{$params["bComplete"]}',
dateDue = '{$params["dDue"]}',
dateUpdated = sysdate(3)
Where dDeleted Is Null
And taskID = '{$params["TaskID"]}'
And listID = '{$params["ListID"]}'
And taskName = '{$params["sTaskName"]}' 

SQL;

$result = mysqli_query($conn, $userQuery);
 
 if (!$result) {
     $data = '{"status":0}';
 } else {
     $data = '{"status":1}';
}

mysqli_close($conn);   // close the connection
echo $data; // No json_encode neeeded here
?>