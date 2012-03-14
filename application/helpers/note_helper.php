<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

function note($note = null)
{

?>

	<div id="note_<?php echo $note->id; ?>" class="dash note" style="left:<?php echo $note->position_x; ?>px;top:<?php echo $note->position_y; ?>px;z-index:<?php echo $note->position_z; ?>;">
	
		<div class="header handle"></div>
		
		<?php note_content($note->note_content); ?>
		
		<div class="pagination">
			<a href="#" class="up"><?php echo lang('note_prev_page'); ?></a>
			<a href="#" class="down"><?php echo lang('note_next_page'); ?></a>
		</div>
		
		<div class="options">
		
			<a href="#note_edit_<?php echo $note->id; ?>" class="edit"><?php echo lang('note_edit'); ?></a>
		
			<a href="#note_remove_<?php echo $note->id; ?>" class="remove"><?php echo lang('note_remove'); ?></a>
		
		</div>
	
	</div><!-- #note_<?php echo $note->id; ?> -->

<?php

}

function note_content($content = '')
{

?>

	<div class="content">
		<div class="inner">	
			<?php echo str_replace("\n", '<br />', $content); ?>
		</div>
	</div>

<?php

}

function note_edit($note = null)
{

?>

	<div class="content form">
		<div class="inner">
			<textarea name="note_content_<?php echo $note->id; ?>" cols="5" rows="10" style="width:auto;height:auto"><?php echo $note->note_content; ?></textarea>
		</div>
		
		<a href="#note_save_<?php echo $note->id; ?>" class="save">Save note</a>
		
		<span class="counter<?php if(strlen($note->note_content) > 160) echo ' full'; ?>"><?php echo strlen($note->note_content); ?></span>
	
	</div>

<?php

}

/* End of file note_helper.php */
/* Location: ./application/helpers/note_helper.php */