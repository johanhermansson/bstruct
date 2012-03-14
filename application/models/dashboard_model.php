<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Dashboard Model
 *
 * @package bStruct
 * @subpackage Models
 */
class Dashboard_model extends CI_Model {

	var $user_id;

	function __construct()
	{
		parent::__construct();
		
		$this->user_id = get_user_id();
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get list of user dashboards
	 * 
	 * @access 	public 
	 * @param	string Variables for parsing (Not used at the moment)
	 * @return 	array|bool
	 */
	function get_dashboards($data = '')
	{
		parse_str($data);
		
		$query = $this->db
			->from('dashboards')
			->where('user_id', $this->user_id)
			->get();
			
		if($query->num_rows() > 0)
		{
			return $query->result();
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get single dashboard
	 * 
	 * @access 	public 
	 * @param	string Variables for parsing (Not used at the moment)
	 * @return 	object|bool
	 */
	function get_dashboard($dashboard_id = 0)
	{
		if($dashboard_id > 0)
		{
			$query = $this->db
				->from('dashboards')
				->where('id', $dashboard_id)
				->where('user_id', $this->user_id)
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
	 * Insert dashboard
	 * 
	 * @access 	public 
	 * @param	array
	 * @return 	integer|bool
	 */
	function insert_dashboard($data = array())
	{
		if($data)
		{
			if( ! isset($data['user_id']))
			{
				$data['user_id'] = $this->user_id;
			}
			
			if($data['user_id'] > 0)
			{
				if($this->db->insert('dashboards', $data))
				{
					return $this->db->insert_id();
				}
			}
		}
		
		return FALSE;
	}

}

/* End of file dashboard_model.php */ 
/* Location: ./application/models/dashboard_model.php */