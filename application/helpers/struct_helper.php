<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

function struct($struct = null)
{

?>

	<div id="struct_<?php echo $struct->id; ?>" class="dash struct" style="left:<?php echo $struct->position_x; ?>px;top:<?php echo $struct->position_y; ?>px;z-index:<?php echo $struct->position_z; ?>;">
		
		<div class="content">
		
			<?php struct_header($struct); ?>
			
			<?php if(isset($struct->items) && $struct->items['result'] !== FALSE && $struct->items['total'] > 0): ?>
			
				<?php foreach($struct->items['result'] as $item): ?>
		
					<?php struct_item($item); ?>
			
				<?php endforeach; ?>
			
			<?php endif; ?>
		
		</div>
		
		<div class="options">
		
			<a href="#struct_add_<?php echo $struct->id; ?>" class="add"><?php echo lang('struct_item_add'); ?></a>
		
			<a href="#struct_remove_<?php echo $struct->id; ?>" class="remove"><?php echo lang('struct_remove'); ?></a>
		
		</div>
	
	</div><!-- #struct_<?php echo $struct->id; ?> -->

<?php

}

function struct_header($struct = null)
{

?>

			<div id="struct_title_<?php echo $struct->id; ?>" class="item header handle">
				<span class="wrap">
					<span class="title"><?php echo $struct->type_title; ?></span>
				</span>
				<a href="#struct_header_edit_<?php echo $struct->id; ?>" class="edit"><?php echo lang('struct_header_edit'); ?></a>
			</div>

<?php

}

function struct_header_edit($struct = null)
{

?>

			<div id="struct_title_<?php echo $struct->id; ?>" class="item header handle">
				<span class="wrap">
					<span class="title"><input name="struct_title_input_<?php echo $struct->id; ?>" value="<?php echo $struct->type_title; ?>" class="input" placeholder="<?php echo lang('struct_placeholder_header'); ?>" /></span>
				</span>
				<a href="#struct_item_edit_<?php echo $struct->id; ?>" class="save"><?php echo lang('struct_header_save'); ?></a>
			</div>

<?php

}

function struct_item($item = null)
{

	if($item)
	{
		$item_id = $item->id;
		$item_updated = $item->date_updated;
		$item_title = $item->item_title;
	}
	else
	{
		$item_id = 'new';
		$item_updated = '';
		$item_title = '';
	}

?>

			<div id="struct_item_<?php echo $item_id; ?>" class="item">
				<?php if($item_id === 'new' || $item->level_time < (time() - strtotime($item_updated))): ?><input type="checkbox" class="checkbox" /><?php endif; ?>
				<span class="wrap">
					<span class="title"><?php echo $item_title; ?></span>
					<span class="updated" title="<?php echo $item_updated ? date('Y/m/d', strtotime($item_updated)) : ''; ?>"><?php echo struct_parse_date($item_updated); ?></span>
				</span>
				<a href="#struct_item_edit_<?php echo $item_id; ?>" class="edit"><?php echo lang('struct_item_edit'); ?></a>
			</div>

<?php

}

function struct_item_edit($item = null)
{
	$CI =& get_instance();
	
	$levels = $CI->struct_model->get_levels();
	
	if($item)
	{
		$item_id = $item->id;
		$item_updated = $item->date_updated;
		$item_title = $item->item_title;
		$item_level = $item->level_id;
	}
	else
	{
		$item_id = 'new';
		$item_updated = '';
		$item_title = '';
		$item_level = 0;
	}

?>

			<div id="struct_item_<?php echo $item_id; ?>" class="item<?php if($item_id == 'new') echo ' new'; ?>">
				<span class="wrap">
					<span class="title"><input name="struct_item_input_<?php echo $item_id; ?>" type="text" value="<?php echo $item_title; ?>" class="input" placeholder="<?php echo lang('struct_placeholder_item'); ?>" /></span>
					<?php if($levels): ?>
					<span class="updated">
						<select name="struct_item_select_<?php echo $item_id; ?>" class="select">
							<?php foreach($levels as $level): ?>
							<option value="<?php echo $level->id; ?>"<?php if($item_level == $level->id) echo ' selected'; ?>><?php echo lang($level->level_title); ?></option>
							<?php endforeach; ?>
						</select>
					</span>
					<?php endif; ?>
				</span>
				<a href="#struct_item_edit_<?php echo $item_id; ?>" class="save"><?php echo lang('struct_item_save'); ?></a>
			</div>

<?php

}

function struct_parse_date($struct_date)
{
	if($struct_date)
	{
		$time = strtotime($struct_date);
		
		// Today
		if(date('Y-m-d', $time) == date('Y-m-d')) return lang('struct_item_today');
		
		// Yesterday
		if(date('Y-m-d', $time) == date('Y-m-d', strtotime('-1 day')) ) return lang('struct_item_yesterday');
		
		// A few days ago
		if($time > strtotime('-1 week')) return lang('struct_item_days');
		
		// A week ago
		if($time < strtotime('-1 week')+259200 AND $time > strtotime('-1 week')-259200) return lang('struct_item_week');
		
		// Over a week ago
		if($time > strtotime('-2 week')) return lang('struct_item_overweek');
		
		// A few weeks ago
		if($time > strtotime('-4 week')) return lang('struct_item_weeks');
		
		// A month ago
		if($time < strtotime('-1 month')+604800 AND $time > strtotime('-1 month')-604800) return lang('struct_item_month');
		
		// Over a month ago
		if($time > strtotime('-3 month')) return lang('struct_item_overmonth');
		
		// A few months ago
		if($time > strtotime('-1 year +3 month')) return lang('struct_item_months');
		
		// A year ago
		if($time < strtotime('-1 year')+7889231 AND $time > strtotime('-1 year')-7889231) return lang('struct_item_year');
		
		return lang('struct_item_years');
	}
	
	return '-';
}