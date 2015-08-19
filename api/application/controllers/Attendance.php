<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once 'Mess.php';
require_once 'User.php';

class Attendance extends CI_Controller {

	public function index()
	{
		print "Attendance functions";
	}

	public function __construct()
	{
		parent::__construct();
		$result['status']=0;
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);	
		$id=$request['id'];
		$user=new User();
		$isInCurrentMess=$user->isInCurrentMess($id);
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
		else if($isInCurrentMess==-1)
		{
			$result['status']=4;
			$result['message']="You have been barred from the mess (Mess Out)";
			print json_encode($result);
			exit();
		}
	}
	
	public function view()
	{
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		
		$mess=new Mess();
		$array['id']=$request['id'];

		$result['status']=0;
		$result['message']="Could not find any Entry";

		$currentMess=$mess->getCurrentMess();
		$array['mid']=$currentMess['mid'];
		$mid=$currentMess['mid'];
		$start=$currentMess['start'];
		$nod=$currentMess['no_of_days'];
		$daysAbsent=$this->db->get_where('attendance',$array)->result();
		for($i=0;$i<$nod;$i++)
		{
			$date=date('Y-m-d',strtotime($start.' +'.$i.' days'));
			if($this->dateAbsent($date,$daysAbsent))
				$days[$date]=0;
			else			
				$days[$date]=1;
		}
		$result['status']=1;
		$result['message']=$days;
		print json_encode($result);

	}

	public function nodPresent($id,$mid)
	{
		$mess = new Mess();
		$query=$this->db->query('select count(*) as count from attendance where id='.$id.' and mid='.$mid);
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

	public function setAbsent()
	{
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		
		$result['status']=0;
		$result['message']="Change Failed";
		$mess=new Mess();
		$user=new User();
		$currentMess=$mess->getCurrentMess();
		$array['id']=$request['id'];
		$array['date']=$request['date'];
		$currenttime=(int)date('Gis');
		$mark=203000;
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
		print json_encode($result);
	}

	public function setPresent()
	{
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		
		$result['status']=0;
		$result['message']="Change Failed";
		$mess=new Mess();
		$currentMess=$mess->getCurrentMess();
		$array['id']=$request['id'];
		$array['date']=$request['date'];
		$currenttime=(int)date('Gis');
		$mark=203000;
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
		print json_encode($result);
	}

	public function getCount()
	{
		$result['status']=1;
		if($temp=$this->enrolled())
			$result['message']=$temp;
		else
			$result['message']=0;
		print json_encode($result);
	}
	public function getTodayCount()
	{
		$array['date']=$this->input->get_post('date');
		$result['status']=1;
		if($temp=$this->enrolled())
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
		print json_encode($result);
	}

	private function enrolled()
	{
		$mess=new Mess();
		$mid=$mess->getCurrentMid();
		$query=$this->db->query("select count(id) as count from inmate where mid=$mid and status=1");
		$temp=$query->row_array();
		return $temp['count'];
	}
	
}

/* End of file Attendance.php */
/* Location: ./application/controllers/Attendance.php */