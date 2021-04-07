<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * User Model
 *
 * @package bStruct
 * @subpackage Models
 */
class User_model extends CI_Model {

	function __construct()
	{
		parent::__construct();
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get single user
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	object|bool
	 */
	function get_user($user_id = 0)
	{
		if($user_id === 0)
		{
			$user_id = get_user_id();
		}
	
		if($user_id > 0)
		{
			$query = $this->db->get_where('users', array('id' => $user_id));
			
			if($query->num_rows() > 0)
			{
				return $query->row();
			}
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Insert user
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	integer|bool
	 */
	function insert_user($data = array())
	{
		if($data)
		{
			if($this->db->insert('users', $data))
			{
				return $this->db->insert_id();
			}

		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Update user
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	bool
	 */
	function update_user($user_id = 0, $data = array())
	{
		if($user_id > 0 AND $data)
		{
			return $this->db
				->where('id', $user_id)
				->update('users', $data);
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Confirm user
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	bool
	 */
	function confirm_user($hash = '')
	{
		$sql = "SELECT * FROM users WHERE MD5(CONCAT('" . SALT . "', '_bstruct_confirmation_', id)) = '{$hash}' AND confirmed IS NULL LIMIT 1";
	
		$query = $this->db->query($sql);
		
		if($query->num_rows() > 0)
		{
			foreach($query->result() as $row)
			{
				if($this->update_user($row->id, array('confirmed' => 1)))
				{
					return TRUE;
				}
			}
		}
				
		return FALSE;
	}

}

/* End of file user_model.php */ 
/* Location: ./application/models/user_model.php */