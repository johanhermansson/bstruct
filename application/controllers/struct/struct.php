<?php

class Struct extends CI_Controller {

	var $colors;

	function __construct()
	{
		parent::__construct();
		
		if(logged_in() !== TRUE OR IS_AJAX !== TRUE)
		{
			exit('No direct script access allowed');
		}
		
		$this->load->language(array('dashboard', 'home', 'settings', 'signup'), get_language());
		
		$this->colors = array('red');
	}
	
	function index()
	{
		exit('No direct script access allowed');
	}

	function add()
	{
		$data = array(
			'theme' => $this->colors[array_rand($this->colors)]
		);
		
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
		
		// Get total of structs
		$total_structs = $this->struct_model->get_structs_number();
		
		// Check total structs against max structs in account type
		if($total_structs >= $account->structs)
		{
			// Max total of lists reached
			die();
		}
		
		// Insert new struct
		$struct_id = $this->struct_model->insert_struct($data);
	
		if($struct_id !== FALSE)
		{
			// Get new struct
			$struct = $this->struct_model->get_struct($struct_id);
			
			if($struct !== FALSE)
			{
				// Print struct
				struct($struct);
			}
		}
	}
	
	function remove()
	{
		$id = get_index($this->input->post('id'));
		
		if($id > 0)
		{
			if($this->struct_model->remove_struct($id) == TRUE)
			{
				exit('1');
			}
		}
		
		exit('0');
	}

}