<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class User_library {

	var $CI;
	
	function __construct()
	{
		 $this->CI =& get_instance();
	}
	
	function login($email = '', $password = '') 
	{
		//Make sure login info was sent
		if($email == '' OR $password == '') 
		{
			return FALSE;
		}

		//Check if already logged in
		if($this->CI->session->userdata('email') == $email) 
		{
			//User is already logged in.
			return TRUE;
		}
		
		//Check against user table
		$this->CI->db
			->select('users.*, languages.language_directory')
			->from('users')
			->join('languages', 'languages.id = users.language_id', 'left')
			->where('users.confirmed >', 0)
			->where('users.email', $email);
				
		$query = $this->CI->db->get();
		
		if ($query->num_rows() > 0) 
		{
			$row = $query->row_array();
			
			//Check against password
			if(encrypt_password($password) != $row['password']) {
				return FALSE;
			}
			
			//Destroy old session
			$this->CI->session->sess_destroy();
			
			//Create a fresh, brand new session
			$this->CI->session->sess_create();
			
			//Remove the password field
			unset($row['password']);
			
			//Set session data
			$this->CI->session->set_userdata($row);
			
			//Set logged_in to true
			$this->CI->session->set_userdata(array('logged_in' => TRUE, 'user_id' => $row['id']));			
			
			//Login was successful			
			return TRUE;
		} 
		else 
		{
			//No database result found
			return FALSE;
		}	

	}

	function logout() 
	{
		//Destroy session
		$this->CI->session->sess_destroy();
	}
	
	function update()
	{
		//Check against user table
		$this->CI->db
			->select('users.*, languages.language_directory')
			->from('users')
			->join('languages', 'languages.id = users.language_id', 'left')
			->where('users.id', get_user_id());
				
		$query = $this->CI->db->get();
		
		if ($query->num_rows() > 0) 
		{
			$row = $query->row_array();
			
			//Destroy old session
			$this->CI->session->sess_destroy();
			
			//Create a fresh, brand new session
			$this->CI->session->sess_create();
			
			//Remove the password field
			unset($row['password']);
			
			//Set session data
			$this->CI->session->set_userdata($row);
			
			//Set logged_in to true
			$this->CI->session->set_userdata(array('logged_in' => TRUE, 'user_id' => $row['id']));			
			
			//Login was successful			
			return TRUE;
		} 
		else 
		{
			//No database result found
			return FALSE;
		}
	}
	
	function confirmation_mail($user_id = 0)
	{
		if($user_id > 0)
		{
			$user = $this->CI->user_model->get_user($user_id);
			
			if($user !== FALSE)
			{
				$this->CI->load->library('email');
	
				$this->CI->email->from('noreply@bstruct.com');
				$this->CI->email->to($user->email);

				$this->CI->email->subject('bstruct.com | Confirmation');
				
				$confirm_href = site_url('signup/confirm/' . md5(SALT . '_bstruct_confirmation_' . $user->id));
				
				$this->CI->email->message(sprintf(lang('confirmation_email'), $confirm_href));
				
				$sent = $this->CI->email->send();
				
				echo '<pre>'; print_r($this->CI->email->print_debugger()); echo '</pre>'; die();

				return $sent;
			}
		}
		
		return FALSE;
	}
	
}