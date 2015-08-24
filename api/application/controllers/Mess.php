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

	public function getDetails($id=0,$op=0)
	{
		$result['status']=0;
		$result['message']="No Details Found";
		if($id==0)
			$id=$this->getCurrentMid();
		$array['mid']=$id;
		$query=$this->db->get_where('mess',$array);
		$temp=$query->row_array();
		if($temp)
		{
			$query=$this->db->query('select id,name,branch, phone from users where id in (select id from sec where mid='.$array['mid'].')');
			$temp['sec']=$query->result();
			if($temp)
			{
				$result['status']=1;
				$result['message']=$temp;
			}
		}
		if($op==0)
			print json_encode($result);
		else
			return $result;
	}

	public function getCurrentMid($buffer=5)
	{
		$query=$this->db->query('select * from mess where start=(select max(start) from mess)');
		$temp=$query->row_array();
		if($temp)
		{
			$today=date('Y-m-d');
			if(date('Y-m-d',strtotime($today.' -'.$buffer.' days'))>date('Y-m-d',strtotime($temp['start'].' +'.$temp['no_of_days'].' days')))
				return 0;
			return($temp['mid']);	
		}
		return 0;
	}

	public function getStartDate()
	{	
		$temp=$this->getMessDetails();
		return($temp['start']);	
	}

	public function getNod()
	{	
		$temp=$this->getMessDetails();
		return($temp['no_of_days']);	
	}

	public function getMessDetails($mid=0)
	{
		if($mid==0)
		{
			$query=$this->db->query('select max(start) as start from mess');
			$temp=$query->row_array();
			if($temp)
				$start=$temp['start'];
			$query=$this->db->query('select * from mess where start = "'.$start.'"');
			$temp=$query->row_array();
		}
		else
		{
			$query=$this->db->query('select * from mess where mid = '.$mid);
			$temp=$query->row_array();

		}
		return($temp);	
	}

	public function enrolled()
	{
		$mid=$this->getCurrentMid();
		$query=$this->db->query("select count(id) as count from inmate where mid=$mid and status=1");
		$temp=$query->row_array();
		return $temp['count'];
	}
}
