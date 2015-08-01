<?php
defined('BASEPATH') OR exit('No direct script access allowed');

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

		$row['start']=$this->input->get_post('start');
		if($temp=$this->input->get_post('nod'))
			$row['no_of_days']=$temp;

		$result['status']=0;
		$result['message']="Some Error Occured";

		if($this->db->insert('mess', $row))
		{
			$result['status']=1;
			$result['message']="Successfully Inserted";
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
		$query=$this->db->query('select mid from mess where start = (select max(start) from mess)');
		$temp=$query->row_array();
		return($temp['mid']);	
	}

	
}
