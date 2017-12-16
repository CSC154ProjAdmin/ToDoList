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
From Lists L
Where L.dDeleted Is Null
And L.UserID = 
(
 Select U.UserID
 From Users U
 Where U.dDeleted Is Null
 And U.UserID = {$params["userID"]}
 And U.sUserName = '{$params["userName"]}'
)
SQL;

$result = mysqli_query($conn, $userQuery);

if (!$result)
{
    die("Could not successfully run query ($userQuery): " .    
        mysqli_error($conn) );
}

$data = array();
if (mysqli_num_rows($result) == 0) 
{
    //print("No records found with query $userQuery");
    $data[0] = -1;
}
else 
{ 
    $idx = 0;
    while ($row = mysqli_fetch_assoc($result))
    {
        $data[$idx]["listID"] = (int)$row["ListID"];
        $data[$idx]["userID"] = (int)$row["UserID"];
        $data[$idx]["listName"] = $row["sListName"];
        $data[$idx]["dateCreated"] = $row["dCreated"];
        $data[$idx]["dateUpdated"] = $row["dUpdated"];
        $idx = $idx + 1;
    }
}

mysqli_close($conn);   // close the connection

echo json_encode($data);
?>
