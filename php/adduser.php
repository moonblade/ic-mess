<?PHP
include("db_details.php");
$username = $_POST['username'];
$name = $_POST['name'];
$pass = md5($_POST['password']);
mysql_connect($server, $user_name, $password);

$db_handle = mysql_connect($server, $user_name, $password);

$db_found = mysql_select_db($database, $db_handle);

if ($db_found) {
// $pass=md5($pass);
$SQL=" INSERT INTO user (username,pass,name) VALUES ('$username' , '$pass','$name' )";
$result = mysql_query($SQL);
if (!$result){
	$message  = 'Invalid query: ' . mysql_error() . "";
}
else{
	$message= "success";
}
mysql_close($db_handle);
print $message;
}


?>