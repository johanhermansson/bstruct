<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Todo Model
 *
 * @package bStruct
 * @subpackage Models
 */
class Todo_model extends CI_Model {

	var $user_id;
	var $dashboard_id;
	
	/**
	 * Constructor
	 */
	function __construct()
	{
		parent::__construct();
		
		$this->user_id = get_user_id();
		$this->dashboard_id = get_dashboard_id();
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get list of todos
	 * 
	 * @access	public 
	 * @param	string Variables for parsing (Not used at the moment)
	 * @return	array|bool
	 */
	function get_todos($data = '')
	{
		parse_str($data);

		$query = $this->db
			->from('todo_lists')
			->where('user_id', $this->user_id)
			->where('dashboard_id', $this->dashboard_id)
			->get();
		
		if($query->num_rows() > 0)
		{
			$result = array();
		
			foreach($query->result() as $row)
			{
				$row->items = $this->get_items("list={$row->id}");
			
				$result[] = $row;
			}
			
			return $result;
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get a single todo list
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	object|bool
	 */
	function get_todo($todo_id = 0)
	{
		if($todo_id > 0)
		{
			$data = array(
				'id' => $todo_id, 
				'user_id' => $this->user_id
			);
		
			$query = $this->db->get_where('todo_lists', $data);
			
			if($query->num_rows() > 0)
			{
				return $query->row();
			}
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Insert a single todo list
	 * 
	 * @access 	public 
	 * @param 	array $data
	 * @return 	int|bool 
	 */
	function insert_todo($data = array())
	{
		if(!isset($data['user_id']))
		{
			$data['user_id'] = $this->user_id;
		}
		
		$data['date_created'] = date('Y-m-d H:i:s');
		
		if(!isset($data['dashboard_id']) OR $data['dashboard_id'] < 1)
		{
			$data['dashboard_id'] = $this->dashboard_id;
		}
			
		if($this->db->insert('todo_lists', $data) == TRUE)
		{
			return $this->db->insert_id();
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Update a todo list
	 * 
	 * @access 	public 
	 * @param	integer
	 * @param 	array
	 * @return 	bool 
	 */
	function update_todo($todo_id = 0, $data = array())
	{
		if($todo_id && $data)
		{
			return $this->db
				->where('id', $todo_id)
				->where('user_id', $this->user_id)
				->update('todo_lists', $data);
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Remove a single todo
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	bool
	 */
	function remove_todo($todo_id = 0)
	{
		if($todo_id)
		{
			$this->db
				->where('list_id', $todo_id)
				->where('user_id', $this->user_id)
				->delete('todo_items');
		
			$this->db
				->where('id', $todo_id)
				->where('user_id', $this->user_id)
				->delete('todo_lists');
		
			return TRUE;
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Returns number of todo lists
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	integer
	 */
	function get_todos_number()
	{
		$query = $this->db
			->from('todo_lists')
			->where('user_id', $this->user_id)
			->where('dashboard_id', $this->dashboard_id)
			->get();
			
		return $query->num_rows();
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get todo items
	 * 
	 * @access 	public 
	 * @param	string Variables for parsing
	 * @return 	array|bool
	 */
	function get_items($data = '')
	{
		parse_str($data);
		
		if(!isset($list)) $list = 0;
		
		if($list > 0)
		{
			$query = $this->db
				->from('todo_items')
				->where('list_id', $list)
				->where('user_id', $this->user_id)
				->order_by('list_order', 'asc')
				->get();
		
			if($query->num_rows() > 0)
			{
				return $query->result();
			}
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get a single todo item
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	object|bool
	 */
	function get_item($item_id = 0)
	{
		if($item_id > 0)
		{
			$data = array(
				'id' => $item_id, 
				'user_id' => $this->user_id
			);
		
			$query = $this->db->get_where('todo_items', $data);
			
			if($query->num_rows() > 0)
			{
				return $query->row();
			}
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Insert a single todo item
	 * 
	 * @access 	public 
	 * @param 	array $data
	 * @return 	int|bool 
	 */
	function insert_item($data = array())
	{
		if($data)
		{
			if(!isset($data['user_id']))
			{
				$data['user_id'] = $this->user_id;
			}
			
			$data['date_created'] = date('Y-m-d H:i:s');
			
			if($this->db->insert('todo_items', $data) == TRUE)
			{
				return $this->db->insert_id();
			}
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Update a todo item
	 * 
	 * @access 	public 
	 * @param	integer
	 * @param 	array
	 * @return 	bool 
	 */
	function update_item($item_id = 0, $data = array())
	{
		if($item_id && $data)
		{
			return $this->db
				->where('id', $item_id)
				->where('user_id', $this->user_id)
				->update('todo_items', $data);
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Remove a single todo item
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	bool
	 */
	function remove_item($item_id = 0)
	{
		if($item_id)
		{
			return $this->db
				->where('id', $item_id)
				->where('user_id', $this->user_id)
				->delete('todo_items');
		}
		
		return FALSE;
	}
	
	
	// ------------------------------------------------------------------------

	/** 
	 * Returns number of todo items
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	integer
	 */
	function get_items_number($list = 0)
	{
		$query = $this->db
			->from('todo_items')
			->where('user_id', $this->user_id)
			->where('list_id', $list)
			->get();
			
		return $query->num_rows();
	}
}

/* End of file todo_model.php */ 
/* Location: ./application/models/todo_model.php */