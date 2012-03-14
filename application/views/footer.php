	<?php if(logged_in() === TRUE): ?>
	
	</div><!-- #dashboard -->
	
	<!-- Forms -->
	
	<div id="dashform"></div>

	<?php if($selected == 'dashboard'): ?>
	
	<!-- Footer -->
	
	<div id="footer_wrap">
	
		<div id="footer">

			<div id="submenu">
			
				<ul>
				
					<li class="first"><a href="#todo_add" id="todo_add"><?php echo lang('dashboard_submenu_todo'); ?></a></li>
					<li><a href="#struct_add" id="struct_add"><?php echo lang('dashboard_submenu_struct'); ?></a></li>
					<li><a href="#note_add" id="note_add"><?php echo lang('dashboard_submenu_note'); ?></a></li>
					<?php /* <li class="extra_space blue"><a href="#chaos_fix"><?php echo lang('dashboard_submenu_chaos'); ?></a></li> */ ?>
					
				</ul>
			
			</div>
			
			<div id="copyright">Copyright &copy; bstruct.com 2010<?php if(date('Y')>2010) echo '-'.date('Y'); ?></div>
			
		</div><!-- #footer -->
	
	</div><!-- #footer_wrap -->
	
	<?php endif; ?>
	
	<?php endif; ?>
	
</div>

</body>
</html>