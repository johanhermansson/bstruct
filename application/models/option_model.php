<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Option Model
 *
 * @package 	bStruct
 * @subpackage	Models
 */
class Option_model extends CI_Model {
	
	var $options;
	
	function __construct()
	{
		parent::__construct();
		
		$this->options = NULL;
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get list of options
	 * 
	 * @access	public 
	 * @return	array|bool
	 */
	function get_options()
	{
		$query = $this->db->get('options');
		
		if($query->num_rows() > 0)
		{
			$options = array();
			
			foreach($query->result() as $row)
			{
				$options[$row->key] = $row->value;	
			}
			
			return $options;
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get single option
	 * 
	 * @access	public 
	 * @param	string
	 * @return	string
	 */
	function get_option($key = 0)
	{
		if($this->options === NULL)
		{
			$this->options = $this->get_options();
		}
		
		if($this->options !== FALSE)
		{
			if( isset($this->options[$key]) )
			{
				return $this->options[$key];
			}
		}
		
		return '';
	}

}

/* End of file account_model.php */ 
/* Location: ./application/models/option_model.php */