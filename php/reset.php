<?PHP
include("db_details.php");
$pass = md5($_POST['pass']);

function resetall()
{
	if($GLOBALS['pass']==md5("reset"))
	{
		$SQL= "UPDATE user set level='1',score='0'";
		$levelSQL= "UPDATE levels set num='0'";
		$levelresult=mysql_query($levelSQL);
		$nresult=mysql_query($SQL);
		if($nresult && $levelresult)
		{
			$message = "success";
		}
		else
			$message = "fail";
		
	}
	else
		$message = "error";
	print($message);
}

mysql_connect($server, $user_name, $password);
$db_handle = mysql_connect($server, $user_name, $password);
$db_found = mysql_select_db($database, $db_handle);
if ($db_found) 
{
	resetall();
}
mysql_close($db_handle);

?>

