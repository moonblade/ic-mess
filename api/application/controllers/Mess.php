<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once 'User.php';

class Mess extends CI_Controller {

	public function __construct(){
		parent::__construct();
	}

	public function index()
	{
		print "Mess Functions Php";
	}

	public function add()
	{
		$result['status']=0;
		$result['message']="Permission Denied";
		$user = new User();
		$id=$this->input->get_post('id');
		if($user->isMD($id))
		{
			$row['start']=$this->input->get_post('start');
			if($temp=$this->input->get_post('nod'))
				$row['no_of_days']=$temp;

			$result['message']="Some Error Occured";

			if($this->db->insert('mess', $row))
			{
				$result['status']=1;
				$result['message']="Successfully Inserted";
			}	
		}
		
		print json_encode($result);
	}

	public function getDetails($id)
	{
		$result['status']=0;
		$result['message']="No Details Found";

		$array['mid']=$id;
		$query=$this->db->get_where('mess',$array);
		$temp=$query->row_array();
		$this->db->select('id');
		$query=$this->db->get_where('sec',$array);
		$temp['sec']=$query->result();
		if($temp)
		{
			$result['status']=1;
			$result['message']=$temp;
		}
		print json_encode($result);
	}

	public function getDetailsCurrent()
	{
		$this->getDetails($this->getCurrentMid());

	}

	public function getCurrentMid()
	{
		$temp=$this->getCurrentMess();
		return($temp['mid']);	
	}

	public function getStartDate()
	{	
		$temp=$this->getCurrentMess();
		return($temp['start']);	
	}

	public function getCurrentMess()
	{
		$query=$this->db->query('select * from mess where start = (select max(start) from mess)');
		$temp=$query->row_array();
		return($temp);	
	}

	public function addMessSec()
	{
		$result['status']=0;
		$result['message']="Permission Denied";
		$user = new User();
		$id=$this->input->get_post('id');
		if($user->isMD($id))
		{
			
			$flag=1;
			$result['status']=0;
			$result['message']="Could Not Add";
			$sec=$this->input->get_post('sec[]');
			foreach($sec as $toInsert['id'])
			{
				$toInsert['mid']=$this->getCurrentMid();
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


}
