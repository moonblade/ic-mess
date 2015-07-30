<?PHP
include("db_details.php");

function getdetails()
{
	$setup="set @score='-1'";
	$setup2="set @num='0'";
	$SQL = "SELECT @num := if(@score = score, @num, @num + 1) as rank,name,score,level FROM user order by score desc";
	if( mysql_query($setup) && mysql_query($setup2));
	$result = mysql_query($SQL);
	$json = array();
	$num_rows = mysql_num_rows($result);
	if ($num_rows ) 
	{
		while($row=mysql_fetch_assoc($result))
		{
			$json['user_info'][]=$row;
		}
	}
	echo json_encode($json); 
}

mysql_connect($server, $user_name, $password);
$db_handle = mysql_connect($server, $user_name, $password);
$db_found = mysql_select_db($database, $db_handle);
if ($db_found) 
{
	getdetails();
}
mysql_close($db_handle);

?>

