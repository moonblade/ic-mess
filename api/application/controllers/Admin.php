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
		else if(date($array['date'])>date('Y-m-d',strtotime($currentMess['start'].' +'.$currentMess['no_of_days'].' days')))
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
	    $query=$this->db->get_where('inmate',$array);
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
	    $mess=new Mess();
	    if($mid==0)
	    	$mid=$mess->getCurrentMid();
	    $id=$request['acceptId'];
	    $this->db->where('id',$id);
	    $this->db->update('inmate',array('status'=>$status));
   		if($this->db->affected_rows())
   		{
	   		$result['status']=1;
		    $result['message']="Successfully Updated";	
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
			$today=date("Y-m-d");
			$buffer='5';
			$row['start']=$request['start'];
			$current=$mess->getMessDetails();
			if(date($row['start'])<date('Y-m-d',strtotime($current['start'].' +'.$current['no_of_days'].' days')))
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
				if($this->db->insert('mess', $row))
				{
					$result['status']=1;
					$result['message']="Successfully Inserted";
				}	
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
			$this->db->where('mid',$mid);
		    $this->db->update('mess',$array);
	   		$result['status']=1;
		    $result['message']="Successfully Updated";	
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
				$result['message']="Successfully Inserted";
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
			$query=$this->db->query('select id from inmate where mid='.$mid.' and status=1');
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
					$attendance=new Attendance($id);
					$currentMess=$mess->getMessDetails();
					$nod=$attendance->nodPresent($id,$mid);
					$days=$attendance->view($id,$mid,1);
					if($days['status']==1)
						$person->daysPresent=$days['message'];
					$person->nodPresent=$nod;
					$person->cost=$currentMess['establishment']+$person->nodPresent*$currentMess['cost_per_day'];
				}
				$result['status']=1;
				$result['message']=$temp;
			}
		}
		print json_encode($result);
	}
}
