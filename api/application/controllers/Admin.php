<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once 'Mess.php';
require_once 'User.php';
require_once 'Attendance.php';

class Admin extends CI_Controller {
	public function index()
	{
		print "Admin functions";
	}

	public function __construct()
	{
		parent::__construct();
		$result['status']=0;
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);	
		$id=$request['id'];
		$user=new User();
		if(!$user->isSec($id) && !$user->isMD($id))
		{
			$result['message']="Access Restricted";
			print json_encode($result);
			exit();
		}
	}

	public function getCount()
	{
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		$array['date']=Date($request['date']);
		
		$result['status']=0;
		$markdate=date('Y-m-d');
		$currenttime=(int)date('Gis');
		$mess=new Mess();
		$currentMess=$mess->getMessDetails();
		if($array['date']<=$markdate)
		{
			$result['message']="Invalid Date";
		}			
		else if(date($array['date'])>date('Y-m-d',strtotime($currentMess['start'].' +'.$this->actualNod($currentMess).' days')))
		{
			$result['status']=2;
			$result['message']="Mess complete. Create new mess.";
		}
		else{
			$mess = new Mess();
			$result['status']=1;
			if($temp=$mess->enrolled())
			{	
				$query=$this->db->query("select count(id) as count from attendance where date='".$array['date']."'");
				$tempRes=$query->row_array();
				if($tempRes)
					$result['message']=$temp-$tempRes['count'];
				else
					$result['message']=$temp;
			}
			else
				$result['message']=0;
		}
		print json_encode($result);
	}

	public function viewPending($mid=0)
	{
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);

	    $result['status']=0;
	    $result['message']="None Found";
	    $mess=new Mess();
	    if($mid==0)
	    	$mid=$mess->getCurrentMid();

	    $array['mid']=$mid;
	    $query=$this->db->query('select id,mid,status from inmate natural join users where mid='.$mid.' order by name');
	    $temp=$query->result();
	    if($temp)
	    {
			$user=new User();
			foreach ($temp as $person) {
				$sendData['status']=$person->status;
				$search['id']=$person->id;
				$sendData['id']=$search['id'];
				$this->db->select('name, branch');
				$query=$this->db->get_where('users',$search);
				$row=$query->row_array();
				$sendData['name']=$row['name'];
				$sendData['branch']=$row['branch'];
				$appendData[]=$sendData;
			}
	    	$result['status']=1;
			$result['message']=$appendData;	    	
	    }
		print json_encode($result);
	}

	public function changeStatus($status=1,$mid=0)
	{
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);

	    $result['status']=0;
	    $result['message']="None Found";
	    $result['message']=$request;
	    $mess=new Mess();
	    // $id=$request['acceptId'];
	    foreach ($request['acceptId[]'] as $id) 
	    {
	    	$attendance = new Attendance($id,1);
		    $currentMess = $mess->getMessDetails();
		    if($mid==0)
		    	$mid=$mess->getCurrentMid();
		    if($status==1)
		    {
		    	// set previous days absent if status is already 0
		    	$this->db->where('id',$id);
		    	$query=$this->db->get_where('inmate',array('id'=>$id,'mid'=>$currentMess['mid']));
		    	$oldInmate=$query->row_array();
		    	$oldStatus=$oldInmate['status'];
		    	$count=0;
		    	if($oldStatus==0)
		    	{
			    	$today = date('Y-m-d');
			    	$till = date('Y-m-d',strtotime($today));
			    	$from = date('Y-m-d',strtotime($currentMess['start']));
			    	$pointer = $from;
			    	while($pointer<=$till)
			    	{
			    		$this->db->insert('attendance',array('id'=>$id,'date'=>$pointer,'mid'=>$currentMess['mid']));
				    	$pointer = date('Y-m-d',strtotime($pointer.' +1 days'));
			    	}	    		
		    	}
		    	// set rest of the days as present
			    $this->db->where('id',$id);
			    $this->db->update('inmate',array('status'=>$status));
		   		if($this->db->affected_rows())
		   		{
			   		$result['status']=1;
				    $result['message']="Successfully Updated";	
		   		}
		    	$today = date('Y-m-d');
		    	$tomorrow = date('Y-m-d',strtotime($today.' +1 days'));
		    	$till = date('Y-m-d',strtotime($currentMess['start'].' +'.$this->actualNod($currentMess).' days'));
		    	$pointer = $tomorrow;
		    	while($pointer<=$till)
		    	{
		    		$attendance->setPresent($id,$pointer,1);
			    	$pointer = date('Y-m-d',strtotime($pointer.' +1 days'));
		    	}
		    }
		    else if($status==2)
		    {
		    	// set rest of the days as absent
		    	$today = date('Y-m-d');
		    	$tomorrow = date('Y-m-d',strtotime($today.' +1 days'));
		    	$till = date('Y-m-d',strtotime($currentMess['start'].' +'.$this->actualNod($currentMess).' days'));
		    	$pointer = $tomorrow;
		    	while(strtotime($pointer)<=strtotime($till))
		    	{
		    		$result['debug']="boo";
		    		$attendance->setAbsent($id,$pointer,1);
			    	$pointer = date('Y-m-d',strtotime($pointer.' +1 days'));
		    	}
			    $this->db->where('id',$id);
			    $this->db->update('inmate',array('status'=>$status));
		   		if($this->db->affected_rows())
		   		{
			   		$result['status']=1;
				    $result['message']="Successfully Updated";	
		   		}
		    }
		    else
		    {
		   		$this->db->where('id',$id);
			    $this->db->update('inmate',array('status'=>$status));
		   		if($this->db->affected_rows())
		   		{
			   		$result['status']=1;
				    $result['message']="Successfully Updated";	
		   		}
		    }
	    }
   		print json_encode($result);
	}

// MD functions
	public function createMess($nod=30)
	{
		$result['status']=0;
		$result['message']="Permission Denied";
		$user = new User();
	    $mess=new Mess();
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);

		$id=$request['id'];
		if($user->isMD($id))
		{
			$today=date('Y-m-d');
			$buffer='10';
			$offsetDateCorrection='1';
			$row['start']=date('Y-m-d',strtotime($request['start'].' +'.$offsetDateCorrection.' days'));
			$current=$mess->getMessDetails();
			if(date($row['start'])<date('Y-m-d',strtotime($current['start'].' +'.$this->actualNod($current).' days')))
			{
				$result['message']="Date clashes with current mess";
			}
			else if(date($row['start'])>date('Y-m-d',strtotime($today.' +'.$buffer.' days')))
			{
				$result['message']="Date too far away";
			}
			else{
				$result['message']="Database Error";
				$row['no_of_days']=$nod;
				if($row['no_of_days']<1)
				{
					$result['message']="days should be greater than 0";
				}
				else
				{
					if($this->db->insert('mess', $row))
					{
						$result['status']=1;
						$result['message']="Successfully Inserted";
						$result['message']=$request;
					}	
				}
			}

		}
		
		print json_encode($result);
	}

	public function getUsersGreater($level=0, $highLevel=4)
	{
		$result['status']=0;
		$result['message']="Permission Denied";
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		$user= new User();
		$id=$request['id'];
		if($user->isMD($id))
		{
			$result['message']="None Found";
			$array['level >']=$level;
			$array['level <']=$highLevel;
			$this->db->select('id, name, branch');
			$query=$this->db->get_where('users',$array);
			$temp=$query->result();
			if($temp){
		   		$result['status']=1;
			    $result['message']=$temp;	
			}
		}
		print json_encode($result);
	}

	public function editMess($mid=0)
	{
		$result['status']=0;
		$result['message']="Permission Denied";
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		$user = new User();
		$mess = new Mess();
		$id=$request['id'];
		if($user->isMD($id))
		{
			if($mid==0)
				$mid=$mess->getCurrentMid();
			$array['establishment']=$request['establishment'];
			$array['cost_per_day']=$request['cost_per_day'];
			$array['no_of_days']=$request['no_of_days'];
			if($array['no_of_days']<1)
			{
				$result['message']="days should be greater than 0";
			}
			else
			{
				$currentMess=$mess->getMessDetails();
				$start=$currentMess['start'];
				$oldNod=$this->actualNod($currentMess);
				$newNod=$this->actualNod(array('no_of_days'=>$array['no_of_days'],'start'=>$start));
				$toDelete['mid']=$mid;
				for($i=$oldNod; $i<=$newNod;$i++)
				{
					$toDelete['date']=$date=date('Y-m-d',strtotime($start.' +'.$i.' days'));
					$this->db->delete('visibility',$toDelete);
					$this->db->delete('attendance',$toDelete);
				}
				$this->db->where('mid',$mid);
			    $this->db->update('mess',$array);
		   		$result['status']=1;
			    $result['message']="Successfully Updated";	
			}
		}
		print json_encode($result);
	}

	public function getNamesForSec()
	{
		$result['status']=0;
		$result['message']="Database Error";
		$mess = new Mess();
		$mid=$mess->getCurrentMid();
		$query=$this->db->query('select id, name, branch from users where id not in (select id from sec where mid='.$mid.') order by name, branch');
		$temp=$query->result();
		if($temp)
		{
			$result['status']=1;
			$result['message']=$temp;
		}
		print json_encode($result);
	}

	public function deleteSec()
	{
		$result['status']=0;
		$result['message']="Permission Denied";
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		$user = new User();
		$mess = new Mess();
		$id=$request['id'];
		if($user->isMD($id))
		{
			$flag=1;
			$result['status']=0;
			$result['message']="Database Error";
			$sec=$request['sec[]'];
			foreach($sec as $toDelete['id'])
			{
				$toDelete['mid']=$mess->getCurrentMid();
				if($toDelete['mid']!=0)
					if(!$this->db->delete('sec',$toDelete))
						$flag=0;
			}
			if($flag)
			{
				$result['status']=1;
				$result['message']="Successfully Deleted";
			}
		}

		print json_encode($result);
	}

	public function addMessSec()
	{
		$result['status']=0;
		$result['message']="Permission Denied";
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		$user = new User();
		$mess = new Mess();
		$id=$request['id'];
		if($user->isMD($id))
		{
			$flag=1;
			$result['status']=0;
			$result['message']="Database Error";
			$sec=$request['sec[]'];
			foreach($sec as $toInsert['id'])
			{
				$toInsert['mid']=$mess->getCurrentMid();
				if($toInsert['mid']!=0)
					if(!$this->db->insert('sec',$toInsert))
						$flag=0;
			}
			if($flag)
			{
				$result['status']=1;
				$result['message']="Successfully Inserted";
			}
		}

		print json_encode($result);
	}


	public function changeMD($level=3)
	{
		$result['status']=0;
		$result['message']="Permission Denied";
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		$user = new User();
		$id=$request['id'];
		if($user->isMD($id))
		{
			$flag=1;
			$result['status']=0;
			$result['message']="Database Error";
			$md=$request['md[]'];
			foreach($md as $toChange['id'])
			{
				if($toChange['id']!=$id){
					$query=$this->db->get_where('users',$toChange);
					$temp=$query->row_array();
					if($temp['level']<4)
					{	
					    $this->db->where('id',$toChange['id']);
					    $this->db->update('users',array('level'=>$level));
				   		if(!$this->db->affected_rows())
				   			$flag = 0;
					}
				}
			}
			if($flag)
			{
				$result['status']=1;
				$result['message']="Successfully Inserted";
				$result['message']=$request;
			}
		}

		print json_encode($result);
	}

	public function getAllCost($mid=0)
	{
		$result['status']=0;
		$result['message']="Permission Denied";
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		$user = new User();
		$mess = new Mess();
		$id=$request['id'];
		if($user->isMD($id))
		{
			$flag=1;
			$result['status']=0;
			$result['message']="Database Error";
			if($mid==0)
				$mid=$mess->getCurrentMid();
			$query=$this->db->query('select id,amount as costDue from inmate natural join users where mid='.$mid.' and (status=1 or status=2) order by name');
			$temp=$query->result();
			if($temp)
			{
				$result['status']=1;
				foreach($temp as $person)
				{
					$id=$person->id;
					$array['id']=$id;
					$this->db->select('name, branch');
					$query=$this->db->get_where('users',$array);
					$row=$query->row_array();
					if($row)
					{
						$person->name=$row['name'];
						$person->branch=$row['branch'];
					}
					$attendance=new Attendance($id,1);
					$currentMess=$mess->getMessDetails();
					$nod=$attendance->nodPresent($id,$mid);
					$days=$attendance->view($id,$mid,1,1);
					if($days['status']==1)
						$person->daysPresent=$days['message'];
					$person->nodPresent=$nod;
					$person->totalCost=$currentMess['establishment']+$person->nodPresent*$currentMess['cost_per_day'];
					$person->costDue=$person->totalCost-$person->costDue;
				}
				$result['status']=1;
				$temp = json_decode(json_encode($temp),true);
				$array = $temp;
				// $string = '../../history/'.$mid.'.csv';
				$string = ''.$mid.'.csv';
				$f = fopen($string, 'w');

				$Keys = false;
				foreach ($array as $line)
				{
				    if (empty($Keys))
				    {
				    	$prefix=['id','name','branch'];
				    	$Keys=array_keys($line['daysPresent']);
				    	$suffix=['nod','totalCost','costDue'];
				    	$Keys=array_merge($prefix,$Keys,$suffix);
				        fputcsv($f, $Keys);
				        $Keys = array_flip($Keys);
				    }
				    $line_array = array($line['id']);
				    $line_array[]=($line['name']);
				    $line_array[]=($line['branch']);
				    foreach ($line['daysPresent'] as $value)
				    {
				        $line_array[]=($value);
				    }
				    $line_array[]=($line['nodPresent']);
				    $line_array[]=($line['totalCost']);
				    $line_array[]=($line['costDue']);
				    fputcsv($f, $line_array);
				}
				$result['message']=''.$mid.'.csv';
			}
		}
		print json_encode($result);
	}

	public function addMessLeave()
	{
		$result['status']=0;
		$result['message']="Permission Denied";
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		$user = new User();
		$mess = new Mess();
		$id=$request['id'];
		if($user->isMD($id))
		{
			$flag=1;
			$result['status']=0;
			$result['message']="Database Error";
			$date=$request['date[]'];
			$toInsert['mid']=$mess->getCurrentMid();
			foreach($date as $toInsert['date'])
			{
				if($toInsert['mid']!=0){
					$this->db->delete('attendance',$toInsert);
					if(!$this->db->insert('visibility',$toInsert))
						$flag=0;
				}
			}
			if($flag)
			{
				$result['status']=1;
				$result['message']="Successfully Inserted";
			}
		}
		print json_encode($result);
	}


	public function removeMessLeave()
	{
		$result['status']=0;
		$result['message']="Permission Denied";
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		$user = new User();
		$mess = new Mess();
		$id=$request['id'];
		if($user->isMD($id))
		{
			$currentMess=$mess->getMessDetails();
			$array['mid']=$currentMess['mid'];
			$mid=$currentMess['mid'];
			$start=$currentMess['start'];
			$oldNod=$currentMess['no_of_days'];
			for($i=0;$i<$oldNod;$i++)
			{
				$date=date('Y-m-d',strtotime($start.' +'.$i.' days'));
				$array['date']=$date;
				$query=$this->db->get_where('visibility',$array);
				if($query->row_array())
				{
					$oldNod++;
				}
			}

			$toDelete['mid']=$mess->getCurrentMid();
			$flag=1;
			$result['status']=0;
			$result['message']="Database Error";
			$date=$request['date[]'];
			foreach($date as $toDelete['date'])
			{
				if($toDelete['mid']!=0)
					if(!$this->db->delete('visibility',$toDelete))
						$flag=0;
			}
			if($flag)
			{
				$currentMess=$mess->getMessDetails();
				$newNod=$currentMess['no_of_days'];
				for($i=0;$i<$newNod;$i++)
				{
					$date=date('Y-m-d',strtotime($start.' +'.$i.' days'));
					$array['date']=$date;
					$query=$this->db->get_where('visibility',$array);
					if($query->row_array())
					{
						$newNod++;
					}
				}
				for($i=$newNod; $i<=$oldNod;$i++)
				{
					$toDelete['date']=$date=date('Y-m-d',strtotime($start.' +'.$i.' days'));
					$this->db->delete('visibility',$toDelete);
				}
				$result['status']=1;
				$result['message']="Successfully Removed";
			}

		}

		print json_encode($result);
	}


	function getDates()
	{
		$result['status']=0;
		$result['message']="Permission Denied";
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		$user = new User();
		$mess = new Mess();
		$id=$request['id'];
		if($user->isMD($id))
		{
			$currentMess=$mess->getMessDetails();
			$array['mid']=$currentMess['mid'];
			$mid=$currentMess['mid'];
			$start=$currentMess['start'];
			$nod=$currentMess['no_of_days'];
			for($i=0;$i<$nod;$i++)
			{
				$date=date('Y-m-d',strtotime($start.' +'.$i.' days'));
				$array['date']=$date;
				$query=$this->db->get_where('visibility',$array);
				if(!$query->row_array())
				{
					$temp['date']=$date;
					if($this->beforeToday($date))
						$temp['valid']=0;
					else
						$temp['valid']=1;
					$days[]=$temp;
				}	
				else
				{
					$temp['date']=$date;
					$temp['valid']=2;
					$days[]=$temp;
					$nod++;
				}
			}
			$result['status']=1;
			$result['message']=$days;
		}

		print json_encode($result);
	}

	public function inmateDetails()
	{
		$result['status']=0;
		$result['message']="Permission Denied";
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		$user = new User();
		$id=$request['id'];
		$mess = new Mess();
		$result['message']="Database Error";
		$currentMess=$mess->getMessDetails();
		$array['mid']=$currentMess['mid'];
		$query=$this->db->query('select id,name,branch,amount,bill,status from inmate natural join users where mid='.$currentMess['mid'].' order by name');
		$temp=$query->result();
		if($temp)
		{
			foreach ($temp as $inmate) 
			{
				if($inmate->status==1)
				{
					$attendance = new Attendance($inmate->id,1);
					$inmate->nodPresent=$attendance->nodPresent($inmate->id,$currentMess['mid']);
				}
			}
			$result['status']=1;
			$result['message']=$temp;
		}
		print json_encode($result);
	}

	public function inmateEditCost($changeId,$option=0)
	{
		$result['status']=0;
		$result['message']="Permission Denied";
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		$user = new User();
		$id=$request['id'];
		$result['message']="Database Error";
		$array['amount']=$request['amount'];
		$array['bill']=$request['bill'];
		$query=$this->db->get_where('inmate',array('id'=>$changeId));
		$currentCost=0;
		$person=$query->row_array();
		if($person)
		{
			$currentCost=$person['amount'];
		}
		if($option==0)
			$array['amount']+=$currentCost;

		$this->db->where('id',$changeId);
		$this->db->update('inmate',$array);
		if($this->db->affected_rows())
		{
			$result['status']=1;
			$result['message']="Successfully Altered";
		}
		print json_encode($result);
	}

	private function beforeToday($date)
	{
		$today=date('Y-m-d');
		$today=strtotime($today);
		if(strtotime($date)<=$today)
			return 1;
		return 0;
	}

	public function actualNod($mess)
	{
	    	$Nod=$mess['no_of_days'];
			for($i=0;$i<$Nod;$i++)
			{
				$date=date('Y-m-d',strtotime($mess['start'].' +'.$i.' days'));
				$tempo['date']=$date;
				$query=$this->db->get_where('visibility',$tempo);
				if($query->row_array())
				{
					$Nod++;
				}
			}
			return $Nod;
	}

}