<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

function logged_in()
{
	$CI =& get_instance();
	
	return $CI->session->userdata('logged_in');
}

function get_user_id()
{
	$CI =& get_instance();
	
	return $CI->session->userdata('user_id');
}

function get_default_dashboard()
{
	$CI =& get_instance();
	
	return $CI->session->userdata('default_dashboard');
}

function set_dashboard_id($id = 0)
{
	$CI =& get_instance();
	
	if($id < 1 || $CI->dashboard_model->get_dashboard($id) === FALSE)
	{
		$id = get_default_dashboard();
	}
	
	$CI->session->set_userdata('dashboard_id', $id);
}

function get_dashboard_id()
{
	$CI =& get_instance();
	
	if($CI->session->userdata('dashboard_id') > 1)
	{
		return $CI->session->userdata('dashboard_id');
	}
	
	return get_default_dashboard();
}

function get_language($lang_code = 'EN')
{
	$CI =& get_instance();
	
	if(logged_in() === TRUE)
	{	
		return $CI->session->userdata('language_directory');
	}
	else
	{
		if($lang_code == 'SE')
		{
			return 'swedish';
		}
		else
		{
			return 'english';
		}
	}
}

function get_language_html_code()
{
	$language = get_language();
	
	switch($language)
	{
		case 'swedish':
		
			return 'sv';
		
		break;
		
		default:
			
			return 'en';
			
		break;
	}
}

function get_invites()
{
	$CI = get_instance();
	
	return $CI->session->userdata('invites');
}