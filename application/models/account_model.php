<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Account Model
 *
 * @package bStruct
 * @subpackage Models
 */
class Account_model extends CI_Model {

	function __construct()
	{
		parent::__construct();
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get list of account types
	 * 
	 * @access 	public 
	 * @return 	array|bool
	 */
	function get_accounts()
	{
		$query = $this->db->get('accounts');
		
		if($query->num_rows() > 0)
		{
			return $query->result();
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get single account
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	object|bool
	 */
	function get_account($account_id = 0)
	{
		$query = $this->db
			->from('accounts')
			->where('id', $account_id)
			->get();
		
		if($query->num_rows() > 0)
		{
			return $query->row();
		}
		
		return FALSE;
	}

}

/* End of file account_model.php */ 
/* Location: ./application/models/account_model.php */