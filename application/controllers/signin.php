<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Signin extends CI_Controller {

	function __construct()
	{
		parent::__construct();
		
		$this->load->language(array('dashboard', 'home', 'settings', 'signup'), get_language());
	}

	function index()
	{
		$email = $this->input->post('email');
		$password = $this->input->post('password');
		
		$this->user_library->login($email, $password);
		
		if(logged_in() === TRUE)
		{		
			redirect();
		}
		else
		{
			$data = array(
				'error' => TRUE,
				'email' => $email,
				'password' => $password
			);
		
			$this->load->view('header');
			$this->load->view('signin/form', $data);
			$this->load->view('footer');
		}
	}
	
}