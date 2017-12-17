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
Select *
From Users
Where dDeleted Is Null
And sPassword = BINARY '{$params["password"]}'
And (
  sUserName = '{$params["identifier"]}'
  Or
  sEmail = '{$params["identifier"]}'
)
SQL;

$result = mysqli_query($conn, $userQuery);

if (!$result)
{
    die("Could not successfully run query ($userQuery): " .    
        mysqli_error($conn) );
}

if (mysqli_num_rows($result) != 1) 
{
    //print("Error: Invalid credentials or more than one user found using query $userQuery");
    $data = '{"status":0}';
}
else
{
    
    $row = mysqli_fetch_assoc($result);
    $data = '{
        "status" : 1,
        "user" : {
            "userID"   : '.(int)$row["UserID"].',
            "userName" : "'.$row["sUserName"].'",
            "email"    : "'.$row["sEmail"].'"
        }
    }';
}

mysqli_close($conn);   // close the connection

echo $data; // No json_encode needed here
?>
