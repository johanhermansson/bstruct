<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

	function encrypt_password($password)
	{
		// Pre-emptive codeigniters slashes
		$password = addslashes($password);

		// Old shit from HP code..
		$password = htmlspecialchars($password);
		$password = utf8_decode($password);

		$password_length = strlen($password);
		$password_base64 = base64_encode($password);
	
		$password_hash1 = md5(SALT . $password_base64);
		$password_hash2 = sha1($password_length . strrev($password));
		$password_hash3 = substr($password_hash2, 0, 38) . substr($password_hash2, 7, 9);

		$password_hash4 = $password_hash1 . $password_hash2 . $password_hash3;
	
		for($i = 0; $i < $password_length; $i++) 
		{
			$password_hash4 .= sha1($password_hash4);
		}
	
		$password_hash5 = sha1(md5($password_hash4));
	
		return strrev($password_hash5);
	}