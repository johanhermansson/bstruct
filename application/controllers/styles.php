<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Styles extends CI_Controller {

	function __construct()
	{
		parent::__construct();
		
		$this->load->driver('minify');
	}
	
	function index($filename = '')
	{
		$file = "./assets/styles/{$filename}";
			
		if(file_exists($file) == TRUE && ! is_dir($file))
		{
			header('Content-type: text/css');
		
			echo $this->minify->css->min($file);
	
			exit();
		}

		show_404();
	}
}

/* End of file styles.php */
/* Location: ./application/controllers/styles.php */