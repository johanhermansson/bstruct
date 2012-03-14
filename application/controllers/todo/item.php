<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Todo Item Controller
 *
 * @package		bStruct
 * @subpackage	Controllers
 */
class Item extends CI_Controller {

	/**
	 * Constructor
	 */
	function __construct()
	{
		parent::__construct();
		
		if(logged_in() !== TRUE OR IS_AJAX !== TRUE)
		{
			exit('No direct script access allowed');
		}
		
		$this->load->language(array('dashboard', 'home', 'settings', 'signup'), get_language());
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Index (does nothing)
	 * 
	 * @access	public 
	 */	
	function index()
	{
		exit('No direct script access allowed');
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Toggle item checkbox
	 * 
	 * @access	public
	 */
	function toggle()
	{
		$id = get_index($this->input->post('id'));
		$done = $this->input->post('done');
		
		if($id)
		{
			if($done > 0)
			{
				$data = array('date_completed' => NULL);
			}
			else
			{
				$data = array('date_completed' => date('Y-m-d H:i:s'));
			}
			
			if($this->todo_model->update_item($id, $data))
			{
				exit('1');
			}
		}
		
		exit('0');
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Edit item
	 *
	 * Send POST values:
	 * - string id
	 * - string title
	 * - integer type
	 * 
	 * @access	public
	 */
	function edit()
	{
		$id = get_index($this->input->post('id'));
		$title = strip_tags($this->input->post('title'));
		$type = $this->input->post('type');
		
		if($type)
		{
			switch($type)
			{
				case 'header':
					
					$title = substr($title, 0, 25);
					
					if($this->todo_model->update_todo($id, array('list_title' => $title)) == TRUE)
					{
						$todo = $this->todo_model->get_todo($id);
						
						if($todo)
						{
							todo_header($todo);
						}
					}
			
				break;
			
				case 'item':
					
					$title = substr($title, 0, 50);
					
					if(!$title)
					{
						$this->todo_model->remove_item($id);
						
						exit('');
					}

					if($this->todo_model->update_item($id, array('item_title' => $title)) == TRUE)
					{
						$item = $this->todo_model->get_item($id);
						
						if($item)
						{
							todo_item($item);
						}
					}
					
				break;
				
				case 'new':
					
					$title = substr($title, 0, 50);
					
					if(!$title)
					{
						exit('');
					}
			
					$list_order = 0;
					
					$items = $this->todo_model->get_items("list={$id}");
					
					if($items !== FALSE)
					{
						$last = end($items);
						$list_order = $last->list_order + 1;
						
						if( count($items) >= get_option('max_todo_items') )
						{
							die();
						}
					}
					
					$data = array(
						'list_id' => $id, 
						'item_title' => $title, 
						'list_order' => $list_order
					);
					
					$item_id = $this->todo_model->insert_item($data);
								
					if($item_id > 0)
					{
						$item = $this->todo_model->get_item($item_id);
						
						if($item)
						{
							todo_item($item);
						}
					}
					
				break;
				
			}
		}
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Removes item
	 *
	 * Send POST values:
	 * - string id
	 * 
	 * @access	public
	 */
	function remove()
	{
		$id = get_index($this->input->post('id'));
		
		if($this->todo_model->remove_item($id) == TRUE)
		{
			exit('1');
		}
		
		exit('0');
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
		$list = get_index($this->input->post('list'));
		
		if($type == 'header')
		{
			$todo = $this->todo_model->get_todo($id);
			
			todo_header_edit($todo);
		}
		else
		{
			$item = $this->todo_model->get_item($id);
			
			$items_number = $this->todo_model->get_items_number($list);
			
			if( ! $type AND $items_number >= get_option('max_todo_items'))
    		{
    			die();
    		}
    	
    		todo_item_edit($item);
		}
		
	}
}

/* End of file item.php */ 
/* Location: ./application/controllers/todo/item.php */