<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Positions extends CI_Controller {

	function __construct()
	{
		parent::__construct();
		
		if(logged_in() !== TRUE)
		{
			exit('No direct script access allowed');
		}
	}
	
	function index()
	{
		$json = $this->input->post('json');
		
		$items = json_decode($json);
		
		if(is_array($items))
		{
			foreach($items as $item)
			{
				$item->id = get_index($item->id);
			
				$data = array(
					'position_x' => $item->x,
					'position_y' => $item->y,
					'position_z' => $item->z
				);
				
				if($item->type == 'todo')
				$this->todo_model->update_todo($item->id, $data);
				
				else if($item->type == 'note')
				$this->note_model->update_note($item->id, $data);
				
				else if($item->type == 'struct')
				$this->struct_model->update_struct($item->id, $data);
			}
		}
	}

}