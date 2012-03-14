<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

function get_index($id = '')
{
	if(intval($id) < 1)
	{
		$id = substr(strrchr($id, '_'), 1);
	}
	
	return $id;
}