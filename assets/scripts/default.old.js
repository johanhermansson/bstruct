		
		$(document).ready(function() {
		
			$('.dash').draggable({ 
				stack: '.dash',
				appendTo: 'body',
				containment: 'document',
				cursor: 'move',
				handle: '.handle',
				refreshPositions: true,
				stop: function(event, ui) {
					
					var data = new Array();
					
					$('.dash').each(function(i) {
						var type = '';
						
						if($(this).hasClass('todo'))
						type = 'todo';
						
						else if($(this).hasClass('note'))
						type = 'note';
						
						var item_data = {
							'type': type,
							'id': $(this).attr('id'),
							'x': $(this).position().left,
							'y': $(this).position().top,
							'z': $(this).css('z-index')
						};
						 
						data[data.length] = item_data;
					});
					
					var data = 'json=' + $.toJSON(data);
					
					$.post(ROOT + 'dash/positions', data);
				}	
			});
			
			// Todo items
			$('.dash.todo .item span').click(function() {
				
				var 
				span = $(this),
				item_id = $(this).parent().attr('id'),
				parent = $(this).parents('.dash:first'),
				content = $(this).text(),
				width = parent.width() + 10,
				left = parent.position().left + $(this).parent().position().left - 5,
				top = parent.position().top + $(this).parent().position().top;

				// Prepare container
				$('#dashform')
					.width(width)
					.css('left', left)
					.css('top', top)
					.empty()
					.fadeIn();

				// Create input
				$('<input>')
					.attr('type', 'text')
					.val(content)
					.blur(function() { $('#dashform').hide(); })
					.keyup(function(e) {
						if(e.keyCode == 13)
						{
							var
							value = $(this).val(),
							data = 'id=' + item_id + '&title=' + value;
						
							// Only send data if it has changed
							if(value != content)
							{
								$.post(ROOT + 'todo/item/edit', data, function(status) {
									var color = 'red';
								
									if(status > 0) 
									{
										span.text(value);
										color = 'green';
									}
									
									$('#' + item_id).css('background-color', color).animate({'background-color': $(parent).css('background-color')});
								});
							}
							
							$('#dashform').hide();
						}
					})
					.appendTo('#dashform')
					.focus();
			});
			
			// Notes
			$('.dash.note .content').click(function() {
			
				var
				note = $(this).parent(),
				content = $(this),
				text = $(this).html().replace(/\r/gi, '').replace(/<br>/gi, '\n'),
				width = $(this).width() + 6,
				height = $(this).height() + 6,
				left = $(this).parent().position().left + 26,
				top = $(this).parent().position().top + 36;
				
				$('#dashform')
					.width(width)
					.height(height)
					.css('left', left)
					.css('top', top)
					.empty()
					.fadeIn();
					
				$('<textarea>')
					.val(text)
					.blur(function() { 
						var
						value = $(this).val()
						data = {
							'id': note.attr('id'),
							'content': $(this).val()
						};
						
						// Only send data if it has changed
						if(value != text)
						{
							$.post(ROOT + 'note/edit', data, function(result) {
								if(result) 
								{
									content.html(result);
								}
							});
						}
										
						$('#dashform').hide();
					})
					.appendTo('#dashform')
					.focus();
				
				//alert(text);
			
			});
		
		
		
			/*	
		
			var modes = new Array('default', 'move', 'edit', 'color', 'remove');
			var mode = 0;
			
			var setMode = function() {
				if(mode == 1)
				$('body').css('cursor', 'move');
				else if(mode == 2)
				$('body').css('cursor', 'text');
				else if(mode == 3)
				$('body').css('cursor', 'help');
				else if(mode == 4)
				$('body').css('cursor', 'crosshair');
				else
				$('body').css('cursor', 'default');
			};
			
			$('.dash').draggable({ 
				stack: '.dash',
				appendTo: 'body',
				containment: 'document',
				refreshPositions: true,
				stop: function(event, ui) {
					var id = $(this).attr('id'),
					x = $(this).position().top,
					y = $(this).position().left,
					data = 'type=todo&id=' + id + '&x=' + x + '&y=' + y;
			
				//$.post('update_positions.php', data);
				}	
			});
			
			$('.dash').draggable('disable');
		
			$(this).rightClick(function() {
				
				for(var i = 0; i < modes.length; i++)
				{
					if(i == (modes.length - 1)) { mode = 0; break; }
					else if(mode == i - 1) { mode = i; break; }
				}
				
				setMode();
				
				// Move start
				if(mode == 1)
				{
					$('.dash').draggable('enable');
				}
				// Move end
				
				
				
				// Edit start
				else if(mode == 2)
				{
					$('.dash').draggable('disable');
				}
				// Edit end
				
				
				
				// Color start
				else if(mode == 3)
				{
					$('.dash').draggable('disable');
				}
				// Color end
				
				
				
				// Remove start
				else if(mode == 4)
				{
					$('.dash').draggable('disable');
				}			
				// Remove end
				
				
				// Default start
				else
				{
					$('.dash').draggable('disable');
				}
				// Default end
				
			});
			
			
			
			
			
			
			
			
			
			
			
			
			
			/*$('.dash').draggable({ 
				stack: '.dash',
				appendTo: 'body',
				containment: 'document',
				refreshPositions: true,
				stop: function(event, ui) {
					var id = $(this).attr('id'),
					x = $(this).position().top,
					y = $(this).position().left,
					data = 'type=todo&id=' + id + '&x=' + x + '&y=' + y;
					
					//$.post('update_positions.php', data);
				}	
			});
			
			$('.dash .sortable').sortable({ 
				delay: 200,
				cursor: 'move',
				helper: 'clone',
				sort: function(event, ui) {
					$(ui.item).children('.item').addClass('unclickable');
				},
				stop: function(event, ui) {
					$(ui.item).children('.item').removeClass('unclickable');
				},
				update: function(event, ui) {
					var data = 'type=todo&' + $(this).sortable('serialize');
					
					//$.post('update_order.php', data);
				}
			});
			
			
			// To do
			$('.dash.todo').css('width', $('.dash.todo').outerWidth() + 1 + 'px');
			
			$('.dash.todo .item span')
				.mouseup(function() {
					if(!$(this).parent().hasClass('unclickable'))
					{
						var id = $(this).parent().attr('id'),
						done = 1;
					
						if($(this).parent().hasClass('done'))
						done = 0;
					
						var data = 'id=' + id + '&done=' + done;
						
						alert(data);
					
						/*
						
						$.post('todo_toggle.php', data, function(success) {
							if(success)
							{
								if(done) $('#' + id).addClass('done');
								else $('#' + id).removeClass('done');
							}
						});
					
						*/
				//	}
				//});
				
			/*$('.todo_item_edit').click(function() {
			
				var text;
			
				if($(this).parent().find('span:first'))
				{
					text = $(this).parent().find('span:first').text();
				}
				else
				{
					text = $(this).parent().find('input:first').val();
				}
				
				alert(text);
				
				$('<input type="text" value="' + text + '" />')
					.appendTo($(this).parent().find('.item:first').empty())
					.focus();
			
			});*/
					
		});