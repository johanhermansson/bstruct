<div class="box outer">

	<div class="biglogo"><h1><a href="<?php echo site_url(); ?>"><img src="<?php echo site_url('assets/images/bstruct_biglogo_beta.png'); ?>" alt="bstruct.com" /></a></h1></div>

	<div class="box inner">

		<?php echo form_open('signup/send', array('class' => 'large')); ?>
		
		<?php echo validation_errors('<div class="message error">', '</div>'); ?>

		<?php echo lang('signup_email', 'email'); ?>
		<div class="input"><?php echo form_input('email', ''); ?></div>

		<?php echo lang('signup_password', 'password'); ?>
		<div class="input"><?php echo form_password('password', ''); ?></div>
		
		<?php echo lang('signup_password_repeat', 'password_repeat'); ?>
		<div class="input"><?php echo form_password('password_repeat', ''); ?></div>
	
		<?php /*<p>
			<?php echo form_label('What is one plus two?', 'question'); ?>
			<div class="input"><?php echo form_input('question', ''); ?></div>
		</p> */ ?>
		
		<div class="submit">
			<?php echo form_submit('submit', lang('signup_submit')); ?>
		</div>

		<?php echo form_close(); ?>
		
	</div>
	
	<div class="copyright">Copyright © bstruct.com 2010-2011</div>

</div>