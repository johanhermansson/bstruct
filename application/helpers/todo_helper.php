<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

function todo($todo = null)
{

?>

	<div id="todo_list_<?php echo $todo->id; ?>" class="dash todo <?php echo $todo->theme; ?>" style="left:<?php echo $todo->position_x; ?>px;top:<?php echo $todo->position_y; ?>px;z-index:<?php echo $todo->position_z; ?>;">
		
		<?php todo_header($todo); ?>
		
		<div class="items sortable">
		
		<?php if(isset($todo->items) && $todo->items !== FALSE && count($todo->items) > 0): ?>
			
			<?php foreach($todo->items as $item): ?>
		
				<?php todo_item($item); ?>
			
			<?php endforeach; ?>
			
		<?php endif; ?>
		
		</div>

		<div class="options">
		
			<a href="#todo_item_add_<?php echo $todo->id; ?>" class="add"><?php echo lang('todo_item_add'); ?></a>
			
			<a href="#todo_list_color_<?php echo $todo->id; ?>" class="color"><?php echo lang('todo_color'); ?></a>
		
			<a href="#todo_list_remove_<?php echo $todo->id; ?>" class="remove"><?php echo lang('todo_remove'); ?></a>
		
		</div>

	</div><!-- #todo_list_<?php echo $todo->id; ?> -->

<?php

}

function todo_header($todo = null)
{

?>

		<div class="header handle">
		
			<span><?php echo $todo->list_title ? $todo->list_title : '&nbsp;'; ?></span>
			
			<a href="#todo_header_edit_<?php echo $todo->id; ?>" class="edit"><?php echo lang('todo_header_edit'); ?></a>
		
		</div>

<?php

}

function todo_header_edit($todo = null)
{

?>

			<div class="header clearfix handle">
			
				<input name="todo_item_input" type="text" value="<?php echo $todo->list_title; ?>" class="input" maxlength="25" />
				
				<a href="#todo_header_save_<?php echo $todo->id; ?>" class="save"><?php echo lang('todo_item_save'); ?></a>
				
			</div>
			
<?php

}

function todo_item($item = null)
{

?>

			<div id="todo_item_<?php echo $item->id; ?>" class="item <?php if($item->date_completed) echo ' done'; ?>">
			
				<input type="checkbox" class="checkbox"<?php if($item->date_completed) echo ' checked'; ?> />
			
				<span><?php echo $item->item_title; ?></span>
				
				<a href="#todo_item_edit_<?php echo $item->id; ?>" class="edit"><?php echo lang('todo_item_edit'); ?></a>
				
			</div>
			
<?php

}

function todo_item_edit($item = null)
{

	if($item)
	{
		$item_id = $item->id;
		$item_completed = $item->date_completed;
		$item_title = $item->item_title;
	}
	else
	{
		$item_id = 'new';
		$item_completed = '';
		$item_title = '';
	}

?>

			<div id="todo_item_<?php echo $item_id; ?>" class="item <?php if($item_completed) echo ' done'; if($item_id == 'new') echo ' new'; ?>">
			
				<input name="todo_item_input" type="text" value="<?php echo $item_title; ?>" class="input" maxlength="50" />
				
				<a href="#todo_item_save_<?php echo $item_id; ?>" class="save"><?php echo lang('todo_item_save'); ?></a>
				
			</div>
			
<?php

}
