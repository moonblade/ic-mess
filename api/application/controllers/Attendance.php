<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once 'Mess.php';
require_once 'User.php';

class Attendance extends CI_Controller {

	public function index()
	{
		print "Attendance functions";
	}

	public function __construct($id=0,$op=0)
	{
		parent::__construct();
		$result['status']=0;
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);	
	    $origId=$id;
	    if($id==0)
			$id=$request['id'];
		$user=new User();
		$isInCurrentMess=$user->isInCurrentMess($id);
		if($op==0)
		{
			if($isInCurrentMess==null)
			{
				$result['status']=2;
				$result['message']="You haven't enrolled in the current mess yet";
				print json_encode($result);
				exit();
			}
			else if($isInCurrentMess==0)
			{
				$result['status']=3;
				$result['message']="You haven't been Accepted to the current mess yet";
				print json_encode($result);
				exit();
			}
			else if($isInCurrentMess==2)
			{
				$result['status']=4;
				$result['message']="You have been barred from the mess (Mess Out)";
				print json_encode($result);
				exit();
			}
		}
	}
	
	public function view($id=0,$currentMid=0,$op=0,$type=0)
	{
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
			
		$mess=new Mess();
		if($id==0)
			$array['id']=$request['id'];
		else
			$array['id']=$id;


		$result['status']=0;
		$result['message']="Could not find any Entry";
		$currentMess=$mess->getMessDetails($currentMid);
		$array['mid']=$currentMess['mid'];
		$mid=$currentMess['mid'];
		$start=$currentMess['start'];
		$nod=$currentMess['no_of_days'];
		$daysAbsent=$this->db->get_where('attendance',$array)->result();
		for($i=0;$i<$nod;$i++)
		{
			$date=date('Y-m-d',strtotime($start.' +'.$i.' days'));
			$visibility['mid']=$array['mid'];
			$visibility['date']=$date;
			$query=$this->db->get_where('visibility',$visibility);
			if(!$query->row_array())
			{
				if($type==0)
				{
					if($this->dateAbsent($date,$daysAbsent))
						$days[$date]=0;
					else			
						$days[$date]=1;
				}
				else
				{
					if($this->dateAbsent($date,$daysAbsent))
						$days[$date]="No";
					else			
						$days[$date]="Yes";					
				}
			}	
			else
			{
				$nod++;
			}
		}
		$result['status']=1;
		$result['message']=$days;
		if($op==0)
			print json_encode($result);
		return $result;

	}

	public function nodPresent($id,$mid)
	{
		$mess = new Mess();
		$query=$this->db->query('select count(*) as count from attendance where id='.$id.' and mid='.$mid.' and date not in (select date from visibility where mid='.$mid.')');
		$temp=$query->row_array();
		$nod=$mess->getNod();
		if($temp)
		{
			$nod=$nod-$temp['count'];
		}
		return $nod;
	}

	private function dateAbsent($date,$daysAbsent)
	{
		foreach($daysAbsent as $dayAbsent)
		{
			if($dayAbsent->date==$date)
				return 1;
		}
		return 0;
	}

	public function setAbsent($id=0,$date=0,$op=0)
	{
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		
		$result['status']=0;
		$result['message']="Change Failed";
		$mess=new Mess();
		$user=new User();
		$currentMess=$mess->getMessDetails();
		if($id==0)
			$array['id']=$request['id'];
		else
			$array['id']=$id;
		if($date==0)
			$array['date']=$request['date'];
		else
			$array['date']=$date;
		$currenttime=(int)date('Gis');
		$mark=210000;
		$markdate=date('Y-m-d');
		if($currenttime>$mark)
			$markdate=date('Y-m-d',strtotime($markdate.' +1 days'));
		if($user->isSec($array['id']))
			$markdate=date('Y-m-d',strtotime($markdate.' -1 days'));
		if($user->isMD($array['id']))
			$markdate=date('Y-m-d',strtotime($markdate.' -1 days'));

		if($array['date']<=$markdate)
		{
			$result['message']="Cannot Edit this Date";
		}
			
		else if(date($array['date'])>date('Y-m-d',strtotime($currentMess['start'].' +'.$currentMess['no_of_days'].' days')))
		{
			$result['message']="Cannot Edit this Date";
		}
		else
		{
			$array['mid']=$currentMess['mid'];
			if($this->db->insert('attendance',$array))
			{
				$result['status']=1;
				$result['message']="Successfully Marked Absent";
			}
		}
		if($op==0)
			print json_encode($result);
		return $result['status'];
	}

	public function setPresent($id=0,$date=0,$op=0)
	{
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		
		$result['status']=0;
		$result['message']="Change Failed";
		$mess=new Mess();
		$currentMess=$mess->getMessDetails();
		if($id==0)
			$array['id']=$request['id'];
		else
			$array['id']=$id;
		if($date==0)
			$array['date']=$request['date'];
		else
			$array['date']=$date;
		$currenttime=(int)date('Gis');
		$mark=210000;
		$markdate=date('Y-m-d');
		if($currenttime>$mark)
			$markdate=date('Y-m-d',strtotime($markdate.' +1 days'));
		if($array['date']<=$markdate)
		{
			$result['message']="Invalid Date";
		}
			
		else if(date($array['date'])>date('Y-m-d',strtotime($currentMess['start'].' +'.$currentMess['no_of_days'].' days')))
		{
			$result['message']="Invalid Date";
		}
		else
		{
			$array['mid']=$currentMess['mid'];
			if($this->db->delete('attendance',$array))
			{
				$result['status']=1;
				$result['message']="Successfully Marked Present";
			}
		}
		if($op==0)
			print json_encode($result);
		return $result['status'];
	}

	public function getCount()
	{
		$result['status']=1;
		$mess=new Mess();
		if($temp=$mess->enrolled())
			$result['message']=$temp;
		else
			$result['message']=0;
		print json_encode($result);
	}

	
}

/* End of file Attendance.php */
/* Location: ./application/controllers/Attendance.php */