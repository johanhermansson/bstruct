<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Settings extends CI_Controller {

	var $error;
	var $success;

	function __construct()
	{
		parent::__construct();
		
		if(logged_in() !== TRUE)
		{
			redirect();
		}
	}

	function index()
	{
		$this->load->language(array('dashboard', 'home', 'settings', 'signup'), get_language());
	
		$dashboards = $this->dashboard_model->get_dashboards();
	
		$user = $this->user_model->get_user();
		$languages = $this->language_model->get_languages();

		$header = array(
			'selected' => 'settings',
			'dashboards' => $dashboards
		);

		$content = array(
			'error' => $this->error,
			'success' => $this->success,
			'user' => $user,
			'languages' => $languages
		);
		
		$footer = array(
			'selected' => 'settings'
		);

		$this->load->view('header', $header);
		$this->load->view('settings', $content);
		$this->load->view('footer', $footer);
	}
	
	function send()
	{
		// Load validation library
		$this->load->library('form_validation');
		
		// Set validation rules
		$this->form_validation->set_rules('language', 'Language', 'required');
		
		/*
		$this->form_validation->set_rules('email', 'Email', 'required|valid_email|email_free');
		$this->form_validation->set_rules('password', 'Password', 'required|matches[password_repeat]');
		$this->form_validation->set_rules('password_repeat', 'Password repeat', 'required|matches[password]');
		*/
		
		// Run validation
		if($this->form_validation->run() == FALSE)
		{
			$this->error = 1;
		
			// Load form for error viewing
			$this->index();
		}
		else
		{
			// Load data
			$data = array(
				'language_id' => $this->input->post('language')
			);
			
			// Update user
			if($this->user_model->update_user(get_user_id(), $data) == FALSE)
			{
				$this->error = 2;
			}
			else
			{
				$this->success = 1;
			
				$this->user_library->update();
			}
			
			$this->index();
		}
	}
	
}