<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Home extends CI_Controller {

	function __construct()
	{
		parent::__construct();
		
		$this->load->language(array('dashboard', 'home', 'settings', 'signup'), get_language());
	}

	function index()
	{
		if($this->session->userdata('logged_in') === TRUE)
		{
			$this->dashboard();
		}
		else
		{
			$this->load->view('header');
			$this->load->view('signin/form');
			$this->load->view('footer');
		}
	}
	
	function dashboard($dashboard_id = 0)
	{
		if(logged_in() === TRUE)
		{	
			if($dashboard_id > 0)
			{
				set_dashboard_id($dashboard_id);
				
				redirect(site_url('/'));
			}
		
			$dashboards = $this->dashboard_model->get_dashboards();
			
			$todos = $this->todo_model->get_todos();
			$notes = $this->note_model->get_notes();
			$structs = $this->struct_model->get_structs();
			
			$header = array(
				'selected' => 'dashboard',
				'dashboards' => $dashboards
			);
			
			$content = array(
				'todos' => $todos,
				'notes' => $notes,
				'structs' => $structs
			);
			
			$footer = array(
				'selected' => 'dashboard'
			);
		
			$this->load->view('header', $header);
			$this->load->view('dashboard', $content);
			$this->load->view('footer', $footer);
		}
		else
		{
			redirect();
		}
	}
}

/* End of file home.php */
/* Location: ./application/controllers/home.php */