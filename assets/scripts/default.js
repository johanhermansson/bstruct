jQuery(function($) {
	
	// On load
	
	
	// Draggable
	var dashDraggable = function() {
		$('.dash')
			.draggable('destroy')
			.draggable({ 
				stack: '.dash',
				appendTo: 'body',
				containment: 'document',
				cursor: 'move',
				handle: '.handle',
				refreshPositions: true,
				stop: function() {
					updatePositions();
				}	
			});
	};
	
	dashDraggable();
	
	var resetZIndex = function() {
		
		var z = [];
		var newZ = 1;
		
		$('.dash').each(function() {
			
			z[$(this).css('z-index')] = $(this).attr('id');
			
		});
	
		$.each(z, function(index, value) {
		
			if(value)
			{
				$('#' + value).css('z-index', newZ);
				
				newZ++;
			}
		
		});
		
	};
	
	var updatePositions = function(oldDash) {
	
		var data = new Array();
		
    	resetZIndex();

    	$('.dash').each(function(i) {
    		var type = '';
    
    		if($(this).hasClass('todo'))
    		type = 'todo';
    
    		else if($(this).hasClass('note'))
    		type = 'note';
    		
    		else if($(this).hasClass('struct'))
    		type = 'struct';
    
    		var item_data = {
    			'type': type,
    			'id': $(this).attr('id'),
    			'x': $(this).position().left,
    			'y': $(this).position().top,
    			'z': $(this).css('z-index')
    		};
    		
    		if(type != '')
    		{     
    			data[data.length] = item_data;
    		}
    	});
    	
    	var data = 'json=' + $.toJSON(data);
		
    	$.post(ROOT + 'dash/positions', data);
	
	};
	
	$('.dash .handle').live('mousedown', function() {
	
		//var oThis = $(this);
	
		//$(this).css('z-index', '9999');
		updatePositions();
	
	});
	
	// To do sortable
	var todoSortable = function() {
		$('.dash.todo').each(function() {
			$(this).css('width', 'auto');
			$(this).outerWidth($(this).outerWidth() + 1);
		});
	
		$('.dash.todo .sortable')
			.sortable('destroy')
			.sortable({ 
				cursor: 'move',
				containment: 'parent',
				placeholder: 'placeholder',
				forceHelperSize: true,
				forcePlaceholderSize: true,
				sort: function(event, ui) {
					$(ui.item)
						.parents('.dash')
						.addClass('busy');
				},
				stop: function(event, ui) {
					$(ui.item)
						.parents('.dash')
						.removeClass('busy');
				},
				update: function(event, ui) {
					var
					dash = $(ui.item).parents('.dash'),
					item = $(ui.item),
					item_id = item.attr('id'),
					data = $(this).sortable('serialize');
			
					$.post(ROOT + 'todo/todo/order', data);
				}
			});
	};
	
	todoSortable();
	
	// Click todo checkbox
	$('.dash.todo .item .checkbox').live('change', function() {
		var
		item = $(this).parent(),
		done = item.hasClass('done') ? 1 : 0,
		data = 'id=' + item.attr('id') + '&done=' + done;
	
		$.post(ROOT + 'todo/item/toggle', data, function(status) {
			if(status > 0)
			{
				if(done) item.removeClass('done');
				else item.addClass('done');
			}
		});
		
		return false;
	});

	// Add todo item
	$('.dash.todo .add').live('click', function() {
			
		var 
		dash = $(this).parents('.dash'),
		dash_id = dash.attr('id'),
		items = $('.items', dash),
		data = {
			'list': dash_id
		}
		
		$.post(ROOT + 'todo/item/html_edit', data, function(html) {
		
			var item_id = $(html).attr('id');
			
			$(html).appendTo(items);
			
			$('.input', $('#' + item_id))
			.blur(todoInputBlur)
			.select();
		
		});
		
		return false;
	});
		
	// Edit todo rows
	$('.dash.todo .edit').live('click', function() {
		
		$('.dash.todo .input').blur();
		
		var 
		dash = $(this).parents('.dash'),
		dash_id = dash.attr('id'),
		item = $(this).parent(),
		item_id = item.hasClass('header') ? dash.attr('id') : item.attr('id'),
		type = item.hasClass('header') ? 'header' : 'item',
		data = {
			'id': item_id,
			'type': type,
			'list': dash_id
		};
		
		dash.css('z-index', '9999');
		
		updatePositions();
		
		$.post(ROOT + 'todo/item/html_edit', data, function(html) {
		
			item.replaceWith(html);
			
			if(type == 'header')
			{
				$('.header .input', $('#'+item_id))
				.blur(todoInputBlur)
				.select();
			}
			else
			{
				$('.input', $('#'+item_id))
				.blur(todoInputBlur)
				.select();
			}

		});
		
		return false;
	});
	
	$('.dash.todo .save').live('click', function(e) {
		e.preventDefault();

		var
		dash = $(this).parents('.dash'),
    	item = $(this).parent(),
    	items = $('.item', dash),
    	type = item.hasClass('header') ? 'header' : 'item',
    	item_id = item.hasClass('header') ? dash.attr('id') : item.attr('id'),
    	input = $('.input', item),
    	value = input.val();
    	
    	item_id = item.hasClass('new') ? dash.attr('id') : item_id;
    	type = item.hasClass('new') ? 'new' : type;
    	
    	var data = {
    		'id': item_id,
    		'title': value,
    		'type': type
    	};
    	
    	$.post(ROOT + 'todo/item/edit', data, function(html) {
    		
    		input.unbind('blur');
    		
    		item.replaceWith(html);
    		
    		if((type == 'new' && value) || (type == 'header' && value.length > 0 && items.length < 1))
    		$('.add', dash).click();
    	
    	});
	});
	
	/*
	$('.dash.todo').live('mousedown', function(e) {
		
		var
		dash = $(this),
		items = dash.children('.items'),
		input = $('input', $(this)),
		iX1 = input.position().left
		mX = e.pageX,
		mY = e.pageY;
		
		alert(); return;
		
		if(input)
		{
			input.blur();
		}
	});
	*/
	
	// Todo input fields
	$('.dash.todo .input')
	.live('keyup', function(e) {
		if(e.keyCode == 13)
		{
			$('.save', $(this).parents('.dash')).click();
		}
	});
	
	var todoInputBlur = function(){
		$('.save', $(this).parents('.dash')).click();
	}
	
	// Change color on to do list
	$('.dash.todo .color').live('click', function() {
	
		var 
		todo = $(this).parents('.todo'),
		todo_id = todo.attr('id'),
		data = 'id=' + todo_id;
		
		$.post(ROOT + 'todo/todo/color', data, function(theme) {
			
			todo
				.removeClass('yellow blue green red purple')
				.addClass(theme);
			
		});
		
		return false;	
	});
	
	// Remove to do list
	$('.dash.todo .remove').live('click', function() {
	
		var 
		todo = $(this).parents('.todo'),
		todo_id = todo.attr('id'),
		data = { 
			'id': todo_id
		};
	
		if(confirm('This will remove the whole to do list and all attached items.'))
		{
			$.post(ROOT + 'todo/todo/remove', data, function() {
			
				todo.hide('fold', {}, 1000, function() { $(this).remove(); });
			
			});
		}
		
		return false;
	});
	
	// Add to do list
	$('#todo_add').click(function() {
	
		$.get(ROOT + 'todo/todo/add', null, function(content, status, todo) {
			if(content)
			{				
				$(content)
					.css('z-index', '9999')
					.appendTo($('#dashboard'))
					.find('.edit')
					.click();
				
				updatePositions();
				dashDraggable();
				todoSortable();
			}
		});
		
		return false;
	});
	
	
	// Notes
	
	// Add note
	$('#note_add').click(function() {
	
		$.get(ROOT + 'note/add', null, function(content, status, note) {
			
			if(content)
			{
				$(content)
					.css('z-index', '9999')
					.appendTo($('#dashboard'))
					.find('.edit')
					.click();
				
				updatePositions();
				dashDraggable();
				todoSortable();
			}
			
		});
		
		return false;
	});
	
	$('.dash.note .content').live('click', function() {
		
		var 
		dash = $(this).parents('.dash'),
		note_id = dash.attr('id'),
		options = dash.children('.options');
		
		options.children('.edit').click();
		
	});
	
	// Edit note
	$('.dash.note .edit').live('click', function() {
	
		var 
		dash = $(this).parents('.dash'),
		note_id = dash.attr('id'),
		options = $('.options', dash),
		content = $('.content', dash),
    	width = content.width(),
    	height = content.height();

		dash.css('z-index', '9999');
		
		updatePositions();
		
		if( ! dash.hasClass('editing'))
		{
			$.post(ROOT + 'note/html_edit', { 'id': note_id }, function(html) {
				
				dash.addClass('editing');
				
	    		content.replaceWith(html);
	    		
	    		$('#' + note_id + ' textarea')
	    		.outerWidth(width)
	    		.outerHeight(height - 20)
	    		.focus();
	    		
			});
		}
		
		return false;
	});
	
	// Unfocus note textarea
	$('.dash.note textarea').live('focusout', function() {
		
		var 
		dash = $(this).parents('.dash'),
		content = dash.children('.content');
		
		$('.save', content).click();
		
	});
	
	$('.dash.note textarea').live('keyup', function(e) {
	
		var
		dash = $(this).parents('.dash'),
		counter = $('.counter', dash),
		number = $(this).val().length;
		
		if(number > noteMaxLength)
		counter.addClass('full');
		else
		counter.removeClass('full');
		
		counter.text(number);
	});
	
	// Save note
    $('.dash.note .save').live('click', function() {
    
    	var 
    	dash = $(this).parents('.dash'),
    	note_id = dash.attr('id'),
    	content = $('.content', dash),
    	textarea = $('textarea', dash),
    	options = $('.options', dash),
    	data = { 
    		'id': note_id,
    		'content': textarea.val() 
    	};
    			
    	$.post(ROOT + 'note/edit', data, function(html) {
    		
	   		dash.removeClass('editing');
    		
    		content.replaceWith(html);
    		
    		dash = $('#'+note_id);
    		content = $('.content', dash);
    		
    		var 
    		height = content.height(),
			innerHeight = $('.inner', content).innerHeight();
			
			if(innerHeight > height)
			{
				$('.pagination .down', dash).css('visibility', 'visible');
			}
			
    	});
    	
    	return false;
    })
	
	// Remove note
	$('.dash.note .remove').live('click', function() {
	
		var 
		note = $(this).parents('.dash'),
		note_id = note.attr('id'),
		data = {
			'id': note_id
		};
	
		if(confirm('This will remove the note.'))
		{
			$.post(ROOT + 'note/remove', data, function() {
			
				note.hide('fold', {}, 1000, function() { $(this).remove(); });
			
			});
		}
		
		return false;
	});
	
	// Note pagination
	$('.dash.note .pagination').disableSelection();
	$('.dash.note .pagination a').live('click', function(e){
		
		e.preventDefault();
		
		var
		arrow = $(this),
		pagination = arrow.parent(),
		dash = $(this).parents('.dash'),
		content = $('.content', dash),
		contentHeight = content.height(),
		inner = $('.inner', dash),
		innerHeight = inner.height(),
		innerTop = inner.position().top * -1,
		direction = $(this).hasClass('up') ? 'up' : 'down';
		
		if(inner.hasClass('animating'))
		{
			return false;
		}
		
		if( direction == 'down' && (innerHeight-innerTop) > contentHeight)
		{
			inner.addClass('animating').animate({
				top: '-='+contentHeight
			}, 200, function(){
				innerTop = inner.position().top * -1;
				
				if( (innerHeight-innerTop) <= contentHeight)
				{
					arrow.css('visibility', 'hidden');
				}
				
				if( innerTop > 0 )
				{
					$('.up', pagination).css('visibility', 'visible');	
				}
				
				inner.removeClass('animating');
			});
		}
		
		if( direction == 'up' && (innerTop > 0) )
		{
			inner.addClass('animating').animate({
				top: '+='+contentHeight,
			}, 200, function(){
				innerTop = inner.position().top * -1;
				
				if( (innerHeight-innerTop) > contentHeight)
				{
					$('.down', pagination).css('visibility', 'visible');
				}
				
				if( innerTop <= 0 )
				{
					arrow.css('visibility', 'hidden');
				}
				
				inner.removeClass('animating');
			});
		}
	});
	
	$('.dash.note').each(function(){
	
		var 
		dash = $(this),
		content = $('.content', dash),
		contentHeight = content.height(),
		inner = $('.inner', content),
		innerHeight = inner.height(),
		pagination = $('.pagination', dash);
	
		if(innerHeight > contentHeight)
		{
			$('.down', pagination).css('visibility', 'visible');
		}
	});
	
	
	// Structs

	// Add struct
	$('#struct_add').click(function() {
		$.get(ROOT + 'struct/struct/add', null, function(content, status, struct) {
			
			if(content)
			{
				$(content)
					.css('z-index', '9999')
					.appendTo($('#dashboard'))
					.find('.edit')
					.click();
						
				updatePositions();
				dashDraggable();
				todoSortable();
			}
			
		});
		
		return false;
	});

	// Add struct item
	$('.dash.struct .add').live('click', function() {
		
		var 
		dash = $(this).parents('.dash'),
		dash_id = dash.attr('id'),
		content = $('.content', dash),
		data = {
			'struct': dash_id
		};
		
		$.post(ROOT + 'struct/item/html_edit', data, function(html) {
			
			var item_id = $(html).attr('id');
			
			$(html).appendTo(content);
			
			$('#' + item_id + ' input').select();
			
		});
		
		return false;
	});

	// Edit struct item/header
	$('.dash.struct .edit').live('click', function() {
	
		var
		struct = $(this).parents('.dash'),
		struct_id = struct.attr('id'),
		item = $(this).parents('.item'),
		type = item.hasClass('header') ? 'header' : 'item',
		id = (type == 'header' ? struct.attr('id') : item.attr('id')),
		data = { 
			'id': id,
			'type': type,
			'struct': struct_id
		};
		
		$.post(ROOT + 'struct/item/html_edit', data, function(html) {
		
			if(html)
			{
				item.replaceWith(html);
				
				$('#'+id).find('.input').select();
			}
		
		});
		
		return false;
	});
	
	$('.dash.struct .input').live('keyup', function(e) {
		if(e.keyCode == 13)
		{
			var item = $(this).parents('.item');
			$('.save', item).click();
		}
	});
	
	$('.dash.struct .save').live('click', function() {
		var
		dash = $(this).parents('.dash'),
    	item = $(this).parent(),
    	items = $('.item', dash),
    	type = item.hasClass('header') ? 'header' : 'item',
    	item_id = item.hasClass('header') ? dash.attr('id') : item.attr('id'),
    	value = $('.input', item).val(),
    	level = $('.select', item).val();
    	
    	item_id = item.hasClass('new') ? dash.attr('id') : item_id;
    	type = item.hasClass('new') ? 'new' : type;
    	
    	var data = {
    		'id': item_id,
    		'title': value,
    		'level': level,
    		'type': type
    	};
    	
    	$.post(ROOT + 'struct/item/edit', data, function(html) {
    			
    		item.replaceWith(html);
    		
    		if((type == 'new' && value) || (type == 'header' && value.length > 0 && items.length < 1))
    		dash.children('.add').click();
    	
    	});
	});
	
	$('.dash.struct .item .checkbox').live('click', function() {
		var 
		dash = $(this).parents('.dash'),
		item = $(this).parents('.item'),
		items = dash.children('.content'),
		item_id = item.attr('id'),
		data = { 
			'id': item_id 
		};
		
		$.post(ROOT + 'struct/item/refresh', data, function(html) {
			item.detach();
			items.append(html);
		});
	});
	
	// Remove struct type
	$('.dash.struct .remove').live('click', function() {
	
		var 
		dash = $(this).parents('.dash'),
		struct_id = dash.attr('id'),
		data = {
			'id': struct_id
		};
	
		if(confirm('This will remove the struct.'))
		{
			$.post(ROOT + 'struct/struct/remove', data, function() {
			
				dash.hide('fold', {}, 1000, function() { $(this).remove(); });
			
			});
		}
		
		return false;
	});

});