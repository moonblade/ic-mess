<?PHP
include("db_details.php");
$username = $_POST['username'];
$id = $_POST['id'];
$intid=intval($id);
$level = $_POST['level'];
// $answer=md5($_POST['answer']);
$answer=($_POST['answer']);

function updatelevel(&$message,$level)
{
	$temp="correct";
	$user = $GLOBALS['username'];
	$uid=$GLOBALS['intid'];
	// $level=$GLOBALS['level'];
	$newlevel=$level+1;
	$SCORE="SELECT * from levels where level='$level'";
	$scoreexist=mysql_query($SCORE);
	$scorerow=mysql_fetch_assoc($scoreexist);
	$basescore=$scorerow['basescore'];
	$number_solved=$scorerow['num'];
	$userdetails="SELECT * from user where username='$user'";
	$userresult=mysql_query($userdetails);
	$userrow=mysql_fetch_assoc($userresult);
	$curscore=$userrow['score'];
	if($number_solved>5)
		$newscore=$curscore + $basescore;
	else
		$newscore=$curscore + $basescore + (5-$number_solved)*1000;
	$number_solved=$number_solved+1;
	$SQL= "UPDATE user set level='$newlevel',score='$newscore' where username = '$user'";
	$levelSQL= "UPDATE levels set num='$number_solved' where level='$level'";
	$levelresult=mysql_query($levelSQL);
	$nresult=mysql_query($SQL);
	if($nresult && $levelresult)
	{
		$message = $temp;
	}
	else
		$message = "Correct, but some error happened";
}
function selectlevel(&$message)
{
	// $levels=$GLOBALS['level'];
	$user = $GLOBALS['username'];
	$uid=$GLOBALS['intid'];
	$userdetails="SELECT * from user where username='$user'";
	$userresult=mysql_query($userdetails);
	$userrow=mysql_fetch_assoc($userresult);
	$levels=$userrow['level'];
	$SQL = "SELECT * FROM levels where level = '$levels'";
	$result = mysql_query($SQL);
	$num_rows = mysql_num_rows($result);
	$row = mysql_fetch_assoc($result);
	$key = $row['key'];
	$newlevel=$levels+1;			
	if ($num_rows > 0){
		if($key==$GLOBALS['answer'])
		{
			updatelevel($message,$levels);
		}
		else{
			$message="wrong";
		}	 
	}
	else
		$message= "error";
}

mysql_connect($server, $user_name, $password);
$db_handle = mysql_connect($server, $user_name, $password);
$db_found = mysql_select_db($database, $db_handle);
if ($db_found) 
{
	$message="null";
	selectlevel($message);
	print $message;
}
mysql_close($db_handle);

?>

