<?php
defined('BASEPATH') OR exit('No direct script access allowed');
require_once 'User.php';
require_once 'Mess.php';
class Visibility extends CI_Controller {

	public function index()
	{
		print "Visibility changes";
	}

	public function __construct()
	{
		parent::__construct();
		$result['status']=0;
		$result['message']="Permission Denied";
		if(isset($_REQUEST['id']))
			$id=$_REQUEST['id'];
		else
			die(json_encode($result));
		$user = new User();
		if(!$user->isMD($id))
			die(json_encode($result));
	}

	public function delete()
	{
		$flag=1;
		$result['status']=0;
		$result['message']="Could Not Update Completely";
		$mess=new Mess();
		$dates=$this->input->get_post('date[]');
		$current=$mess->getMessDetails();
		$array['mid']=$current['mid'];
		$count=0;
		foreach ($dates as $array['date']) {
			if($flag)
				if(!$this->db->delete('visibility',$array))
					$flag=0;
		}
		if($flag){
			$result['status']=1;
			$result['message']="Successfully Updated";
		}
		print json_encode($result);
	}
	public function add()
	{
		$flag=1;
		$result['status']=0;
		$result['message']="Could Not Update Completely";
		$mess=new Mess();
		$dates=$this->input->get_post('date[]');
		$current=$mess->getMessDetails();
		$array['mid']=$current['mid'];
		$count=0;
		foreach ($dates as $array['date']) {
			if($flag){
				if(date($array['date'])>date('Y-m-d',strtotime($current['start'].' +'.$current['no_of_days'].' days'))
					||
					date($array['date'])<date($current['start'])){
					$result['message']="Date Out of Bounds";
					$flag=0;
				}
				else if(!$this->db->insert('visibility',$array)){
					$flag=0;
				}
				else
				{
					$count++;
				}
			}
		}
		if($flag){
			$result['status']=1;
			$result['message']="Successfully Edited";
		}
		else{
			for ($i=0;$i<$count;++$i)
			{
				$array['date']=$dates[$i];
				$this->db->delete('visibility',$array);
			}
		}
		print json_encode($result);
	}
}

/* End of file Visibility.php */
/* Location: ./application/controllers/Visibility.php */