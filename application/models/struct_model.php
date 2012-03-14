<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Struct Model
 *
 * @package bStruct
 * @subpackage Models
 */
class Struct_model extends CI_Model {

	var $user_id;
	var $dashboard_id;

	function __construct()
	{
		parent::__construct();
		
		$this->user_id = get_user_id();
		$this->dashboard_id = get_dashboard_id();
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get list of structs
	 * 
	 * @access 	public 
	 * @param	string Variables for parsing (Not used at the moment)
	 * @return 	array|bool
	 */
	function get_structs($data = '') 
	{
		parse_str($data);
	
		$query = $this->db
			->from('struct_types')
			->where('user_id', $this->user_id)
			->where('dashboard_id', $this->dashboard_id)
			->get();

		if($query->num_rows() > 0)
		{
			$result = array();
		
			foreach($query->result() as $row)
			{
				$row->items = $this->get_items("type={$row->id}");
			
				$result[] = $row;
			}
			
			return $result;
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get a single struct
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	object|bool
	 */
	function get_struct($type_id = 0) 
	{
		if($type_id > 0)
		{
			$query = $this->db
				->from('struct_types')
				->where('user_id', $this->user_id)
				->where('dashboard_id', $this->dashboard_id)
				->where('id', $type_id)
				->limit(1)
				->get();

			if($query->num_rows() > 0) 
			{
				return $query->row();
			}
		}

		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Insert a single struct
	 * 
	 * @access 	public 
	 * @param 	array $data
	 * @return 	int|bool 
	 */
	function insert_struct($data = array())
	{
		if($data)
		{
			$data['user_id'] = $this->user_id;
			$data['dashboard_id'] = $this->dashboard_id;
			
			if($this->db->insert('struct_types', $data) === TRUE)
			{
				return $this->db->insert_id();
			}
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Update a struct
	 * 
	 * @access 	public 
	 * @param	integer
	 * @param 	array
	 * @return 	bool 
	 */
	function update_struct($type_id = 0, $data = array())
	{
		if($type_id > 0)
		{
			return $this->db
				->where('user_id', $this->user_id)
				->where('id', $type_id)
				->update('struct_types', $data);
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Remove a struct
	 * 
	 * @access 	public 
	 * @param	integer
	 * @param 	array
	 * @return 	bool 
	 */
	function remove_struct($type_id = 0)
	{
		$items = $this->get_items("type={$type_id}");
		if($items['total'] > 0)
		{
			foreach($items['result'] as $item)
			{
				$this->remove_item($item->id);
			}
		}
	
		return $this->db
			->where('user_id', $this->user_id)
			->where('id', $type_id)
			->delete('struct_types');
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Get number of structs in current dashboard
	 * 
	 * @access 	public 
	 * @param	integer
	 * @param 	array
	 * @return 	integer 
	 */
	function get_structs_number()
	{
		$query = $this->db
			->from('struct_types')
			->where('user_id', $this->user_id)
			->where('dashboard_id', $this->dashboard_id)
			->get();
			
		return $query->num_rows();
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get list of struct items
	 * 
	 * @access 	public 
	 * @param	string
	 * @return 	array|bool
	 */
	function get_items($data = '') 
	{
		parse_str($data);
		
		$total = 0;
		$result = array();
	
		if(!isset($type)) $type = 0;
		
		if($type > 0)
		{
			$query = $this->db
				->select('struct_items.*, struct_levels.level_time, ((UNIX_TIMESTAMP() - UNIX_TIMESTAMP(struct_items.date_updated)) / struct_levels.level_time ) AS item_order', FALSE)
				->from('struct_items')
				->join('struct_levels', 'struct_levels.id = struct_items.level_id')
				->where('struct_items.user_id', $this->user_id)
				->where('struct_items.type_id', $type)
				->group_by('struct_items.id')
				->order_by('item_order', 'desc')
				->get();
				
			$total = $query->num_rows();

			if($query->num_rows() > 0) 
			{
				foreach($query->result() as $row) 
				{
					$result = $query->result();
				}
			}
		}
		
		return array(
			'total' => $total,
			'result' => $result 
		);
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get a single struct item
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	object|bool
	 */
	function get_item($item_id = 0)
	{
		if($item_id > 0)
		{
			$query = $this->db
				->select('struct_items.*, struct_levels.level_time')
				->from('struct_items')
				->join('struct_levels', 'struct_levels.id = struct_items.level_id')
				->where('struct_items.id', $item_id)
				->where('struct_items.user_id', $this->user_id)
				->limit(1)
				->get();
			
			if($query->num_rows() > 0)
			{
				return $query->row();
			}
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Insert a single struct item
	 * 
	 * @access 	public 
	 * @param 	array $data
	 * @return 	int|bool 
	 */
	function insert_item($data)
	{
		$data['user_id'] = $this->user_id;
	
		if($this->db->insert('struct_items', $data) === TRUE)
		{
			return $this->db->insert_id();
		}

		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Update a struct item
	 * 
	 * @access 	public 
	 * @param	integer
	 * @param 	array
	 * @return 	bool 
	 */
	function update_item($item_id, $data)
	{
		if($item_id > 0)
		{
			return $this->db
				->where('user_id', $this->user_id)
				->where('id', $item_id)
				->update('struct_items', $data);
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Remove a struct item
	 * 
	 * @access 	public 
	 * @param	integer
	 * @param 	array
	 * @return 	bool 
	 */
	function remove_item($item_id = 0)
	{
		$item = $this->get_item($item_id);
		
		if($item->user_id == $this->user_id)
		{
			$this->db
				->where('item_id', $item_id)
				->delete('struct_updates');
				
			return $this->db
				->where('id', $item_id)
				->delete('struct_items');
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Refresh a struct item, inserts a new timestamp
	 * 
	 * @access 	public 
	 * @param	integer
	 * @param 	array
	 * @return 	bool 
	 */
	function refresh_item($data)
	{
		$item_update = $this->update_item($data['item_id'], array('date_updated' => $data['date_updated']));
		$item_refresh = $this->db->insert('struct_updates', $data);
	
		if($item_update === TRUE && $item_refresh === TRUE)
		{
			return $this->db->insert_id();
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Get number of items in struct type
	 * 
	 * @access 	public 
	 * @param	integer
	 * @param 	array
	 * @return 	integer 
	 */
	function get_items_number($type = 0)
	{
		$query = $this->db
			->from('struct_items')
			->where('user_id', $this->user_id)
			->where('type_id', $type)
			->get();
			
		return $query->num_rows();
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get list of struct levels
	 * Returns array of objects, or FALSE on error
	 * 
	 * @access 	public 
	 * @param	string
	 * @return 	array|bool
	 */
	function get_levels()
	{
		$query = $this->db
			->from('struct_levels')
			->order_by('level_order', 'asc')
			->get();
			
		if($query->num_rows() > 0)
		{
			return $query->result();
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get single struct level
	 * 
	 * @access 	public 
	 * @param	string
	 * @return 	object|bool
	 */
	function get_level($level_id = 0)
	{
		if($level_id > 0)
		{
			$query = $this->db
				->from('struct_levels')
				->where('id', $level_id)
				->limit(1)
				->get();
				
			if($query->num_rows() > 0)
			{
				return $query->row();
			}
		}
		
		return FALSE;
	}

}

/* End of file struct_model.php */ 
/* Location: ./application/models/struct_model.php */