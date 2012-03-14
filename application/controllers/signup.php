<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Signup extends CI_Controller {

	function __construct()
	{
		parent::__construct();
		
		if(logged_in() === TRUE)
		{
			redirect();
		}
		
		$this->load->language(array('dashboard', 'home', 'settings', 'signup'));
	}

	function index()
	{
		// Load signup form view
		$this->load->view('header');
		$this->load->view('signup/form');
		$this->load->view('footer');
	}
	
	function send()
	{
		// Load validation library
		$this->load->library('form_validation');
		
		// Set validation rules
		$this->form_validation->set_rules('email', lang('signup_email'), 'required|valid_email|email_free');
		$this->form_validation->set_rules('password', lang('signup_password'), 'required|matches[password_repeat]');
		$this->form_validation->set_rules('password_repeat', lang('signup_password_repeat'), 'required|matches[password]');
		
		// Run validation
		if($this->form_validation->run() == FALSE)
		{
			// Load form for error viewing
			$this->index();
		}
		else
		{
			// Load data
			$data = array(
				'email' => $this->input->post('email'),
				'password' => encrypt_password($this->input->post('password'))
			);
			
			// Insert user
			$user_id = $this->user_model->insert_user($data);
			
			if($user_id !== FALSE && $this->user_library->confirmation_mail($user_id))
			{
				$dashboard_id = $this->dashboard_model->insert_dashboard(array('user_id' => $user_id, 'dashboard_title' => 'My dashboard'));
				
				if($dashboard_id > 0)
				{
					$todo_data = array(
						'user_id' => $user_id, 
						'dashboard_id' => $dashboard_id, 
						'list_title' => lang('signup_todo_title'),
						'theme' => 'yellow',
						'date_created' => date('Y-m-d H:i:s')
					);
				
					$todo_id = $this->todo_model->insert_todo($todo_data);
					
					$todo_data = array(
						'user_id' => $user_id,
						'list_id' => $todo_id,
						'item_title' => lang('signup_todo_item_0'),
						'list_order' => 0
					);
					
					$this->todo_model->insert_item($todo_data);
					
					$todo_data = array(
						'user_id' => $user_id,
						'list_id' => $todo_id,
						'item_title' => lang('signup_todo_item_1'),
						'list_order' => 1
					);
					
					$this->todo_model->insert_item($todo_data);
					
					$todo_data = array(
						'user_id' => $user_id,
						'list_id' => $todo_id,
						'item_title' => lang('signup_todo_item_2'),
						'list_order' => 2
					);
					
					$this->todo_model->insert_item($todo_data);
					
					$todo_data = array(
						'user_id' => $user_id,
						'list_id' => $todo_id,
						'item_title' => lang('signup_todo_item_3'),
						'list_order' => 3
					);
					
					$this->todo_model->insert_item($todo_data);
					
					$note_data = array(
						'user_id' => $user_id,
						'dashboard_id' => $dashboard_id,
						'note_content' => lang('signup_note')
					);
					
					$this->note_model->insert_note($note_data);
				
					$this->user_model->update_user($user_id, array('default_dashboard' => $dashboard_id));
				}
			
				// Load success view
				$this->load->view('header');
				$this->load->view('signup/success');
				$this->load->view('footer');
			}
			else
			{
				$this->load->view('header');
				$this->load->view('signup/failure');
				$this->load->view('footer');
			}
		}
	}
	
	function confirm($hash = '')
	{
		if($hash)
		{
			if($this->user_model->confirm_user($hash) === TRUE)
			{
				// Load signup form view
				$this->load->view('header');
				$this->load->view('signup/confirmed');
				$this->load->view('footer');
			} 
			else show_404();
		} 
		else show_404();
	}
	
}