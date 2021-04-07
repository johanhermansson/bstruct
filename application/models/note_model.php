<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Note Model
 *
 * @package bStruct
 * @subpackage Models
 */
class Note_model extends CI_Model {

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
	 * Get list of notes
	 * 
	 * @access 	public 
	 * @param	string Variables for parsing (Not used at the moment)
	 * @return 	array|bool
	 */
	function get_notes($data = '')
	{
		// parse_str( $data );
		
		$this->db
			->from('notes')
			->where('user_id', $this->user_id)
			->where('dashboard_id', $this->dashboard_id);
			
		$query = $this->db->get();
		
		if($query->num_rows() > 0)
		{
			return $query->result();
		}	
	
		return FALSE;
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get a single note
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	object|bool
	 */
	function get_note($note_id = 0)
	{
		if($note_id > 0)
		{
			$this->db
				->from('notes')
				->where('user_id', $this->user_id)
				->where('id', $note_id)
				->limit(1);
				
			$query = $this->db->get();
			
			if($query->num_rows() > 0)
			{
				return $query->row();
			}
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Insert a single note
	 * 
	 * @access 	public 
	 * @param 	array $data
	 * @return 	int|bool 
	 */
	function insert_note($data = array())
	{
		if(!isset($data['user_id']))
		{
			$data['user_id'] = $this->user_id;
		}
		
		if(!isset($data['dashboard_id']) OR $data['dashboard_id'] < 1)
		{
			$data['dashboard_id'] = $this->dashboard_id;
		}
	
		if($this->db->insert('notes', $data) == TRUE)
		{
			return $this->db->insert_id();
		}
	
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Update a single note
	 * 
	 * @access 	public 
	 * @param	integer
	 * @param 	array
	 * @return 	bool 
	 */
	function update_note($note_id = 0, $data = array())
	{
		if($note_id > 0 && $data)
		{
			return $this->db
				->where('id', $note_id)
				->where('user_id', $this->user_id)
				->update('notes', $data);
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Remove a single note
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	bool
	 */
	function remove_note($note_id = 0)
	{
		if($note_id > 0)
		{
			return $this->db
				->where('id', $note_id)
				->where('user_id', $this->user_id)
				->delete('notes');
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------

	/** 
	 * Returns number of notes
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	integer
	 */
	function get_notes_number()
	{
		$query = $this->db
			->from('notes')
			->where('user_id', $this->user_id)
			->where('dashboard_id', $this->dashboard_id)
			->get();
			
		return $query->num_rows();
	}
}

/* End of file note_model.php */ 
/* Location: ./application/models/note_model.php */