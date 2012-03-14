<div class="box outer">

	<div class="biglogo"><h1><a href="<?php echo site_url(); ?>"><img src="<?php echo site_url('assets/images/bstruct_biglogo_beta.png'); ?>" alt="bstruct.com" /></a></h1></div>
	
	<div class="caption">
	
		<p><?php echo lang('home_welcome_text'); ?></p>
	
	</div>
	
	<div class="box inner">
		
		<?php echo form_open('signin', array('class' => 'large')); ?>

			<?php 
		
			$field_error = ''; 
		
			if(isset($error) && $error === TRUE): 
		
				$field_error = ' error'; ?>
		
			<div class="message error">
		
				<?php echo lang('home_signin_error'); ?>
		
			</div>
		
			<?php endif; ?>
		
			<?php echo lang('home_email', 'email'); ?>
			<div class="input<?php echo $field_error; ?>">
				<?php echo form_input('email', '', 'id="home_email"'); ?>			
			</div>
			
			<?php echo lang('home_password', 'password'); ?>
			<div class="input<?php echo $field_error; ?>">
				<?php echo form_password('password', '', 'id="home_password"'); ?>
			</div>
			
			<div class="submit">
			
				<?php echo form_submit('submit', lang('home_submit')); ?>
			
			</div>
		
		<?php echo form_close(); ?>
	
	</div>
	
	<div class="copyright">Copyright © bstruct.com 2010-2011</div>

</div>