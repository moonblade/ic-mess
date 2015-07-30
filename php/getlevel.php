<?PHP
include("db_details.php");
$username = $_POST['username'];
$id = $_POST['id'];
function selectlevel()
{
	$user = $GLOBALS['username'];
	$uid=$GLOBALS['id'];
	$userdetails="SELECT * from user where username='$user'";
	$userresult=mysql_query($userdetails);
	$num_rows=mysql_num_rows($userresult);
	if($num_rows>0)
		{
			$userrow=mysql_fetch_assoc($userresult);
			$levels=$userrow['level'];
			print $levels;
		}
		else
			print "error";
}

mysql_connect($server, $user_name, $password);
$db_handle = mysql_connect($server, $user_name, $password);
$db_found = mysql_select_db($database, $db_handle);
if ($db_found) 
{
	selectlevel();
}
mysql_close($db_handle);

?>

