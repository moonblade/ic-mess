<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once 'Mess.php';
require_once 'Attendance.php';

class User extends CI_Controller {

	public function __construct(){
		parent::__construct();
	}

	public function index()
	{
		print "User Functions Php";
	}

	public function register()
	{
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);
		$row=$request;
		if(array_key_exists('pass', $row))
			$row['pass']=md5($row['pass']);
		if(array_key_exists('name', $row))
			$row['name']=strtoupper($row['name']);
		if(array_key_exists('branch', $row))
			if($row['branch']=='CIV')
				$row['branch']='CE';
		// name, email, pass, branch, address, dob, father, mother, phone, phonedad, phonemom, bloodgroup

		$result['status']=0;
		$result['message']=$_REQUEST;
		$result['message']="Email Already Exists";

		if($this->db->insert('users', $row))
		{
			$result['status']=1;
			$result['message']="Successfully Inserted";
		}
		print json_encode($result);
	}

	public function login()
	{
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata);
	
		$row['email']=$request->email;
		$row['pass']=md5($request->pass);
		
		$result['status']=0;
		$result['message']="Invalid Username or Password";
		$query=$this->db->get_where('users',$row);
		$temp=$query->row_array();
		if($temp)
		{
			if($this->isSec($temp['id']) && $temp['level']<2)
				$temp['level']="2";
			$result['status']=1;
			$result['message']=$temp;
		}
		print json_encode($result);
	}

	public function changePassword()
	{
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata,true);

		$array['id']=$request['id'];
		$user=$request['user'];
		$array['pass']=md5($user['pass']);
		$newrow['pass']=md5($user['newpass']);
		
		$result['status']=0;
		$result['message']="Incorrect Password";
		$result['message']=$request;
		$this->db->update('users',$newrow,$array);
		if($this->db->affected_rows())
		{
			$result['status']=1;
			$result['message']="Successfully Updated";
		}	
		print json_encode($result);
	}

	public function sendFeedback()
	{
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata,true);
		$result['status']=0;
		$result['message']="Database Error";
		$array['id']=$request['id'];
		$array['feedback']=$request['feedback'];
		if($this->db->insert('feedback', $array))
		{
			$result['status']=1;
			$result['message']="Submitted Successfully";
		}
		print json_encode($result);
	}


	public function editProfile()
	{
		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata,true);

	    $profile=$request['profile'];
	    $array['id']=$profile['id'];
	    $newprofile = array(
	    	'bloodgroup'=>$profile['bloodgroup'],
	    	'phone'=>$profile['phone'],	
	    	'father'=>$profile['father'],	
	    	'phonedad'=>$profile['phonedad'],	
	    	'mother'=>$profile['mother'],	
	    	'phonemom'=>$profile['phonemom'],	
	    	'address'=>$profile['address'],
	    	'dob'=>$profile['dob']
    	);
		$result['status']=0;
		$result['message']="No changes made";
		$this->db->update('users',$newprofile,$array);
		if($this->db->affected_rows())
		{
			$result['status']=1;
			$result['message']="Successfully Updated";
		}
		print json_encode($result);
	}

	public function getCostDetails($mid=0,$op=0)
	{
		$result['status']=0;
		$result['message']="Mess complete";

		$postdata = file_get_contents("php://input");
	    $request = json_decode($postdata, true);	
		$id=$request['id'];
		$mess=new Mess();
		if($mid==0)
			$mid=$mess->getCurrentMid();
		$isInCurrentMess=$this->isInMess($id,$mid);
		$attendance = new Attendance();
		$mess = new Mess();
		$currentMess = $mess->getDetails($mid,2);
		if($currentMess['status']==1)
		{
			$currentMess = $currentMess['message'];
			$temp['daysPresent']=$attendance->nodPresent($id,$mid);
			$temp['cost']=$currentMess['establishment']+$temp['daysPresent']*$currentMess['cost_per_day'];
			$result['status']=1;
			$result['message']=$temp;
		}
		if($op==0)
			print json_encode($result);
		return($result);
	}

	public function isInMess($id,$mid,$op=0)
	{
		$mess=new Mess();
		$array['id']=$id;
		$array['mid']=$mid;
		$query=$this->db->get_where('inmate',$array);
		$temp=$query->row_array();
		$result['message']=$temp['status'];
		if($op!=0)
			print json_encode($result);
		return($temp['status']);
	}

	public function isInCurrentMess($id)
	{
		$mess=new Mess();
		$array['id']=$id;
		$array['mid']=$mess->getCurrentMid();
		return($this->isInMess($array['id'],$array['mid']));
	}

	public function isMD($id)
	{
			$array['id']=$id;
			$query=$this->db->get_where('users',$array);
			$temp=$query->row_array();
			if($temp['level']>2)
				return 1;
			return 0;
	}
	public function isSec($id)
	{
			$array['id']=$id;
			$mess=new Mess();
			$array['mid']=$mess->getCurrentMid();
			$query=$this->db->get_where('sec',$array);
			if($query->row_array())
				return 1;
			return 0;
	}
	public function isSuperAdmin($id)
	{
			$array['id']=$id;
			$query=$this->db->get_where('users',$array);
			$temp=$query->row_array();
			if($temp['level']>9)
				return 1;
			return 0;
	}


	public function enroll($id)
	{
		$result['status']=0;
		$result['message']='Database Error';
		$mess = new Mess();
		$array['id']=$id;
		$array['mid']=$mess->getCurrentMid();
		if($this->db->insert('inmate',$array))
		{
			$result['status']=1;
			$result['message']='Successfully Enrolled';
		}

		print json_encode($result);

	}
	
}
