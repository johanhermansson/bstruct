<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Signout extends CI_Controller {

	function __construct()
	{
		parent::__construct();
	}

	function index()
	{
		$this->user_library->logout();
		
		redirect();
	}
	
}