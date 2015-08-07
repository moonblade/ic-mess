<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once 'Mess.php';

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
		$row=$_REQUEST;
		if($row['pass'])
			$row['pass']=md5($row['pass']);
		// name, email, pass, branch, address, dob, father, mother, phone, phonedad, phonemom, bloodgroup

		$result['status']=0;
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
		$row['email']=$this->input->get_post('email');
		$row['pass']=md5($this->input->get_post('pass'));
		
		$result['status']=0;
		$result['message']="Invalid Username or Password";
		$query=$this->db->get_where('users',$row);
		$temp=$query->row_array();
		if($temp)
		{
			$result['status']=1;
			$result['message']=$temp;
		}
		print json_encode($result);
	}

	public function changePassword()
	{
		$id=$this->input->get_post('id');
		$row['email']=$this->input->get_post('email');
		$newrow['email']=$this->input->get_post('email');
		$row['pass']=md5($this->input->get_post('pass'));
		$newrow['pass']=md5($this->input->get_post('newpass'));
		
		$result['status']=0;
		$result['message']="Invalid Username or Password";

		if($id)
		{
			$result['message']="Some Error Occured";
			$this->db->where('id',$id);
			$this->db->update('users',array('pass'=>$newrow['pass']));
			if($this->db->affected_rows())
			{
				$result['status']=1;
				$result['message']="Successfully Updated";
			}	
		}
		else{
			$this->db->where($row);
			$this->db->update('users',$newrow);
			if($this->db->affected_rows())
			{
				$result['status']=1;
				$result['message']="Successfully Updated";
			}
		}

		print json_encode($result);
	}

	public function isInMess($id)
	{
		$mess=new Mess();
		$array['id']=$id;
		$array['mid']=$mess->getCurrentMid();
		$array['status']=1;
		$query=$this->db->get_where('inmate',$array);
		$temp=$query->row_array();
		return($temp['status']);
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
}
