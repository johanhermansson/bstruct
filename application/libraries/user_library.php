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
				$url = 'https://api.sendgrid.com/';
				$sendgrid_apikey = 'REDACTED_SENDGRID_API_KEY';

				$confirm_href = site_url('signup/confirm/' . md5(SALT . '_bstruct_confirmation_' . $user->id));
				
				$params = array(
					'to'        => $user->email,
					'subject'   => 'bstruct.com | Confirmation',
					'text'      => sprintf(lang('confirmation_email'), $confirm_href),
					'from'      => 'noreply@sumway.dev',
				);
				
				$request =  $url.'api/mail.send.json';
				
				// Generate curl request
				$session = curl_init($request);
				// Tell curl to use HTTP POST
				curl_setopt ($session, CURLOPT_POST, true);
				// Tell curl that this is the body of the POST
				curl_setopt ($session, CURLOPT_POSTFIELDS, $params);
				curl_setopt($session, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $sendgrid_apikey));
				// Tell curl not to return headers, but do return the response
				curl_setopt($session, CURLOPT_HEADER, false);
				// Tell PHP not to use SSLv3 (instead opting for TLS)
				curl_setopt($session, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
				curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
				
				// obtain response
				$response = curl_exec($session);
				curl_close($session);

				$response = json_decode( $response, true );

				return is_array( $response ) and $response['message'] === 'success';
			}
		}
		
		return FALSE;
	}
	
}