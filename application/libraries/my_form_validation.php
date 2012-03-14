<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/**
* MY_Form_Validation Class
*
* Extends Validation library
*
* Adds one validation rule, valid_url to check if a field contains valid url
*/

class My_form_validation extends CI_Form_validation {

	var $CI;

    function __construct()
    {
        parent::__construct();
        
        $CI =& get_instance();
    }

    // --------------------------------------------------------------------

    /**
     * email_free
     *
     * @access    public
     * @param    field
     * @return    bool
     */
    function email_free($field)
    {   
        $this->CI->form_validation->set_message('email_free', 'The %s is already registered to an account');
        
        $field = trim($field);
        
        $query = $this->CI->db->get_where('users', array('email' => $field));
        
        if($query->num_rows > 0)
        {
        	return FALSE;
        }

		return TRUE;
    }

    /**
     * valid_url
     *
     * @access    public
     * @param    field
     * @return    bool
     */
    function valid_url($field)
    {   
        $this->CI->form_validation->set_message('valid_url', 'Fältet <strong>%s</strong> måste innehålla en korrekt url.');

$url_format = 
'/^(https?):\/\/'.                                         // protocol
'(([a-z0-9$_\.\+!\*\'\(\),;\?&=-]|%[0-9a-f]{2})+'.         // username
'(:([a-z0-9$_\.\+!\*\'\(\),;\?&=-]|%[0-9a-f]{2})+)?'.      // password
'@)?(?#'.                                                  // auth requires @
')((([a-z0-9][a-z0-9-]*[a-z0-9]\.)*'.                      // domain segments AND
'[a-z][a-z0-9-]*[a-z0-9]'.                                 // top level domain  OR
'|((\d|[1-9]\d|1\d{2}|2[0-4][0-9]|25[0-5])\.){3}'.
'(\d|[1-9]\d|1\d{2}|2[0-4][0-9]|25[0-5])'.                 // IP address
')(:\d+)?'.                                                // port
')(((\/+([åäöÅÄÖa-zA-Z0-9$_\.\+!\*\'\(\),;:@&=-]|%[0-9a-f]{2})*)*'. // path
'(\?([åäöÅÄÖa-zA-Z0-9$_\.\+!\*\'\(\),;:@&=-]|%[0-9a-f]{2})*)'.      // query string
'?)?)?'.                                                   // path and query string optional
'(#([åäöÅÄÖa-zA-Z0-9$_\.\+!\*\'\(\),;:@&=-]|%[0-9a-f]{2})*)?'.      // fragment
'$/i';

		return ( ! preg_match($url_format, $field)) ? FALSE : TRUE;

        //return ( ! preg_match('/^(http|https):\/\/([A-Z0-9][A-Z0-9_-]*(?:\.[A-Z0-9][A-Z0-9_-]*)+):?(\d+)?\/?/i', $field)) ? FALSE : TRUE;
    }
	
    /**
     * valid_password
     *
     * @access    public
     * @param    field
     * @return    bool
     */
	function valid_password($field)
	{
		$this->CI->form_validation->set_message('valid_password', '<strong>%s</strong> stämmer inte överens med lösenordet som redan är lagrat.');
		
		$company_id = $this->CI->session->userdata('id');
		
		$company = $this->CI->companies_model->get_single($company_id);
		
		if($company !== 0)
		{
			$password = encrypt_password($field);
		
			if($password == $company->password)
			{
				return TRUE;
			}
		}
		
		return FALSE;
	}
	
	function valid_date($field)
	{
		$this->CI->form_validation->set_message('valid_date', 'Fältet <strong>%s</strong> måste innehålla ett korrekt datum.');
		
		$field = substr($field, 0, 10);
		
		$year = intval(substr($field, 0, 4));
		$month = intval(substr($field, 5, 2));
		$day = intval(substr($field, 8, 2));
		
		return checkdate($month, $day, $year);
	}
}