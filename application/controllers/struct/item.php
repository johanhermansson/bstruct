<?php

class Item extends CI_Controller {

	function __construct()
	{
		parent::__construct();
		
		if(logged_in() !== TRUE || IS_AJAX !== TRUE)
		{
			exit('No direct script access allowed');
		}
		
		$this->load->language(array('dashboard', 'home', 'settings', 'signup'), get_language());
	}
	
	function index()
	{
		exit('No direct script access allowed');
	}
	
	function edit()
	{
		$id = get_index($this->input->post('id'));
		$title = strip_tags($this->input->post('title'));
		$type = $this->input->post('type');
		$level = $this->input->post('level');
		
		if($type)
		{
			switch($type)
			{
				case 'header':
					
					$title = substr($title, 0, 25);
					
					if($title)
					{
						$this->struct_model->update_struct($id, array('type_title' => $title));
					}
					
					$struct = $this->struct_model->get_struct($id);
					
					if($struct)
    				{
    					struct_header($struct);
    				}
			
				break;
			
				case 'item':
					
					$title = substr($title, 0, 50);
					
					if( ! $title)
					{
						$this->struct_model->remove_item($id);
						
						exit('');
					}
					
					$data = array(
						'level_id' => $level,
						'item_title' => $title
					);
					
					if($this->struct_model->update_item($id, $data) == TRUE)
					{
						$item = $this->struct_model->get_item($id);
						
						if($item)
						{
							struct_item($item);
						}
					}
					
				break;
				
				case 'new':
					
					$title = substr($title, 0, 50);
					
					if( ! $title)
					{
						exit('');
					}
					
					$items_number = $this->struct_model->get_structs_number();
					if($items_number >= get_option('max_struct_items'))
					{
						die();
					}
					
					$data = array(
						'type_id' => $id, 
						'level_id' => $level,
						'item_title' => $title, 
						'date_created' => date('Y-m-d H:i:s')
					);
					
					$item_id = $this->struct_model->insert_item($data);
					
					if($item_id)
					{
						$item = $this->struct_model->get_item($item_id);
						
						if($item)
						{
							struct_item($item);
						}
					}
					
				break;
				
			}
		}
	}
	
	function refresh()
	{
		$id = get_index($this->input->post('id'));
		$data = array(
			'item_id' => $id, 
			'date_updated' => date('Y-m-d H:i:s')
		);
		
		$item = $this->struct_model->get_item($id);
		$level = $this->struct_model->get_level($item->level_id);
		
		if($level->level_time < (strtotime($data['date_updated']) - strtotime($item->date_updated)))
		{
			$this->struct_model->refresh_item($data);
			
			$item = $this->struct_model->get_item($id);
		}
		
		if($item)
		{
			struct_item($item);
		}
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get form HTML for item or header
	 *
	 * Send POST values:
	 * - string id
	 * - integer type
	 * - string list
	 * 
	 * @access	public
	 */
	function html_edit()
	{
		$id = get_index($this->input->post('id'));
		$type = $this->input->post('type');
		$struct = get_index($this->input->post('struct'));
		
		if($type == 'header')
		{
			$struct = $this->struct_model->get_struct($id);
			struct_header_edit($struct);
		}
		else
		{
			$item = $this->struct_model->get_item($id);
			
			$items_number = $this->struct_model->get_items_number($struct);
			
			if( ! $type AND $items_number >= get_option('max_struct_items'))
    		{
    			die();
    		}
			
			struct_item_edit($item);
		}
	}

}

/* End of file item.php */ 
/* Location: ./application/controllers/struct/item.php */