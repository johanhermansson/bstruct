<div id="settings">

	<h1><?php echo lang('settings_title'); ?></h1>

	<?php echo form_open('settings/send', array('class' => 'large')); ?>

		<?php if($error > 0): ?>

		<?php echo validation_errors('<p class="settings error">', '</p>'); ?>
	
		<?php if($error == 2): ?>
		
		<p class="message error"><?php echo lang('settings_error_2'); ?></p>
		
		<?php endif ?>
		
		<?php endif; ?>
		
		<?php if($success == 1): ?>
		
		<p class="message success"><?php echo lang('settings_success'); ?></p>
		
		<?php endif; ?>

		<p>
			<?php echo lang('settings_language', 'language'); ?>
			<?php 
			
			$options = array();
			
			foreach($languages as $language):
			
				$options[$language->id] = $language->language_title;
			
			endforeach;
			
			echo '<div class="select">' . form_dropdown('language', $options, $user->language_id) . '</div>'; 
			
			?>
		</p>

		<?php /*<p>
			<?php echo form_label('Change email', 'email'); ?>
			<?php echo form_input('email', $user->email, 'disabled'); ?>
		</p>

		<p>
			<?php echo form_label('New password', 'password_new'); ?>
			<?php echo form_password('password_new', ''); ?>
		</p>
		
		<p>
			<?php echo form_label('Repeat new password', 'password_new_repeat'); ?>
			<?php echo form_password('password_new_repeat', ''); ?>
		</p>
		
		<p>
			<?php echo form_label('Password', 'password'); ?>
			<?php echo form_password('password', ''); ?>
		</p>*/ ?>
		
		<p class="submit">
			<?php echo form_submit('submit', lang('settings_update')); ?>
		</p>

	<?php echo form_close(); ?>

</div>