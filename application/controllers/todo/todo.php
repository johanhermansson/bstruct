<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Todo List Controller
 *
 * @package		bStruct
 * @subpackage	Controllers
 */
class Todo extends CI_Controller {

	var $colors;
	
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
		
		$this->colors = array('yellow', 'red', 'blue', 'purple', 'green');
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
	 * Add todo list
	 * 
	 * @access	public
	 */
	function add()
	{
		$data = array('theme' => $this->colors[array_rand($this->colors)]);
		
		// Get current subscription
		$subscription = $this->subscription_model->get_current();
		
		if($subscription !== FALSE)
		{
			// Get current account type if a subscription exists
			$account = $this->account_model->get_account($subscription->account_id);
		}
		else
		{
			// Get the free account type if no subscription exists
			$account = $this->account_model->get_account(1);
		}
		
		// Get total of lists
		$total_lists = $this->todo_model->get_todos_number();
		
		// Check total lists against max lists in account type
		if($total_lists >= $account->todos)
		{
			// Max total of lists reached
			die();
		}
		
		// Insert new list
		$list_id = $this->todo_model->insert_todo($data);
		
		if($list_id !== FALSE)
		{
			// Get new list
			$todo = $this->todo_model->get_todo($list_id);
			
			if($todo !== FALSE)
			{
				// Print new list
				todo($todo);
			}
		}
	}
	
	function order()
	{
		$items = $this->input->post('todo_item');
		
		if($items)
		{
			$order = 0;
		
			foreach($items as $item_id)
			{
				$this->todo_model->update_item($item_id, array('list_order' => $order));
				
				$order++;
			}
			
			exit('1');
		}
		
		exit('0');
	}
	
	function color()
	{
		$id = get_index($this->input->post('id'));
		
		$color = '';
		
		if($id > 0)
		{
			$todo = $this->todo_model->get_todo($id);
		
			if($todo !== FALSE)
			{
				$color = $todo->theme;
			
				$selected = array_search($todo->theme, $this->colors);
				
				if($this->colors[$selected] == end($this->colors))
				{
					$color = $this->colors[0];
				}
				else 
				{
					$color = $this->colors[$selected + 1];
				}
				
				$todo = $this->todo_model->update_todo($id, array('theme' => $color));
			}
		}
		
		exit($color);
	}
	
	function remove()
	{
		$id = get_index($this->input->post('id'));
		
		if($id > 0)
		{
			if($this->todo_model->remove_todo($id) == TRUE)
			{
				exit('1');
			}
		}
		
		exit('0');
	}
}

/* End of file todo.php */ 
/* Location: ./application/controllers/todo/todo.php */