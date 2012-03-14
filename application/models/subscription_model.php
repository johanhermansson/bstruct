<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Subscription Model
 *
 * @package bStruct
 * @subpackage Models
 */
class Subscription_model extends CI_Model {

	var $user_id;

	function __construct()
	{
		parent::__construct();
		
		$this->user_id = get_user_id();
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get list of subscriptions
	 * 
	 * @access 	public 
	 * @param	string Not used at the moment
	 * @return 	array|bool
	 */
	function get_subscriptions($data = '')
	{
		parse_str($data);
		
		$query = $this->db
			->from('subscriptions')
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
	 * Get single subscription
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	object|bool
	 */
	function get_subscription($subscription_id = 0)
	{
		$query = $this->db
			->from('subscriptions')
			->where('id', $subscription_id)
			->where('user_id', $this->user_id)
			->limit(1)
			->get();
		
		if($query->num_rows() > 0)
		{
			return $query->result();
		}
		
		return FALSE;
	}
	
	// ------------------------------------------------------------------------
	
	/** 
	 * Get current subscription
	 * 
	 * @access 	public 
	 * @param	integer
	 * @return 	object|bool
	 */
	function get_current()
	{
		$query = $this->db
			->from('subscriptions')
			->where('user_id', $this->user_id)
			->where('date_created <=', date('Y-m-d H:i:s'))
			->where('date_until >=', date('Y-m-d H:i:s'))
			->limit(1)
			->get();
			
		if($query->num_rows() > 0)
		{
			return $query->row();
		}
		
		return FALSE;
	}

}

/* End of file subscription_model.php */ 
/* Location: ./application/models/subscription_model.php */