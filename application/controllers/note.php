<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Note extends CI_Controller {

	function __construct()
	{
		parent::__construct();

		if(logged_in() !== TRUE OR IS_AJAX !== TRUE)
		{
			exit('No direct script access allowed');
		}

		$this->load->language(array('dashboard', 'home', 'settings', 'signup'), get_language());
	}
	
	function index()
	{ 
		exit('No direct script access allowed');
	}
	
	function add()
	{
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
		
		// Get total of notes
		$total_notes = $this->note_model->get_notes_number();
		
		// Check total notes against max notes in account type
		if($total_notes >= $account->notes)
		{
			// Max total of notes reached
			die();
		}
		
		// Insert new note
		$note_id = $this->note_model->insert_note();
			
		if($note_id !== FALSE)
		{
			// Get new note
			$note = $this->note_model->get_note($note_id);
			
			// Print new note
			note($note);
		}
	}
	
	function edit()
	{
		$note_id = get_index($this->input->post('id'));
		$note_content = $this->input->post('content');
		
		while(strstr($note_content, "\n\n\n"))
		{
			$note_content = str_replace("\n\n\n", "\n\n", $note_content);
		}
		
		$note_content = strip_tags($note_content);
		$note_content = trim($note_content);
		
		$note_content = substr($note_content, 0, 160);
		
		if($note_id > 0)
		{
			$note_data = array(
				'note_content' => $note_content
			);
			
			if($this->note_model->update_note($note_id, $note_data) === TRUE)
			{				
				note_content($note_content);
			}
		}
	}
	
	function remove()
	{
		$id = get_index($this->input->post('id'));
		
		if($id > 0)
		{
			if($this->note_model->remove_note($id) == TRUE)
			{
				exit('1');
			}
		}
		
		exit('0');
	}
	
	function html_edit()
	{
		$id = get_index($this->input->post('id'));
		
		$note = $this->note_model->get_note($id);
		
		if($note !== FALSE)
		{
			note_edit($note);
		}
	}
	
	function textarea_content()
	{
		$content = $this->input->post('content');
		
		$content = strip_tags($content, '<br>');
		
		$content = str_ireplace('<br>', "\n", $content);
		
		exit($content);
	}

}