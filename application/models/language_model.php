<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Language Model
 *
 * @package bStruct
 * @subpackage Models
 */
class Language_model extends CI_Model {

	function __construct()
	{
		parent::__construct();
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get list of languages
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	object|bool
	 */
	function get_languages()
	{
		$query = $this->db->get('languages');
		
		if($query->num_rows() > 0)
		{
			return $query->result();
		}
		
		return FALSE;
	}

}

/* End of file language_model.php */ 
/* Location: ./application/models/language_model.php */