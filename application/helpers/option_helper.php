<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

function get_option($key = '')
{
	$CI =& get_instance();
	
	return $CI->option_model->get_option($key);
}