<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Scripts extends CI_Controller {

	function __construct()
	{
		parent::__construct();
		
		$this->load->driver('minify');
	}
	
	function index($filename = '')
	{
		$file = "./assets/scripts/{$filename}";
			
		if(file_exists($file) == TRUE && ! is_dir($file))
		{
			header('Content-type: text/javascript');
			
			echo $this->minify->js->min($file);
	
			exit();
		}

		show_404();
	}
}

/* End of file scripts.php */
/* Location: ./application/controllers/scripts.php */