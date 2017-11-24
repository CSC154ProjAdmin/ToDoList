<?php
  include "db_connect.php";

  //create short variable names...change names if needed
  $email=$_POST['sEmail'];
  $username=$_POST['sUserName'];
  $password=$_POST['sPassword'];
  $date= date("y-m-d");
  
  session_start();
 
    //change names and values if needed
      $query = "INSERT INTO users (sUserName, sEmail, sPassword, dCreated, dUpdated) " .
               "VALUES ('" . $_POST['sUserName'] . "', '" . $_POST['sEmail'] . "', '" . $_POST['sPassword'] . "', '$date', '$date');";
               
      $result = mysql_query($query) 
        or die(mysql_error());
      $_SESSION['user_logged'] = $_POST['sUserName'];
      $_SESSION['user_password'] = $_POST['sPassword'];
?>
<p>
  Thank you, <?php echo $_POST['sUserName']; ?> for registering!<br>
<?php
      header("Refresh: 4; URL=members.php"); //change to homepage if needed
      echo "Your registration is complete! " .
           "You are being sent to the page you requested!<br>";
      echo "(If your browser doesn't support this, " .
           "<a href=\"members.php\">click here</a>)"; //change to homepage is needed
      die();
   
?>
