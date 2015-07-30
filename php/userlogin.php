<?PHP
include("db_details.php");
$username = $_POST['username'];
$pass = md5($_POST['password']);
mysql_connect($server, $user_name, $password);

$db_handle = mysql_connect($server, $user_name, $password);

$db_found = mysql_select_db($database, $db_handle);

if ($db_found) {
$SQL = "SELECT * FROM user where username = '$username' and pass = '$pass'";
$result = mysql_query($SQL);
$num_rows = mysql_num_rows($result);
$row = mysql_fetch_assoc($result);
$id = $row['id'];

if ($num_rows > 0) {

$message= strval($id);

}
else {

$message= "error";

}
print $message;
}
mysql_close($db_handle);


?>