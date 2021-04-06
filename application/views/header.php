<!DOCTYPE html>
<html lang="<?php echo get_language_html_code(); ?>">
<head>
	<meta charset="utf-8" />
	<title>bstruct.com</title>
	<link rel="shortcut icon" href="<?php echo site_url('assets/images/favicon.ico'); ?>" />
	<link href="https://fonts.googleapis.com/css?family=Lobster|Reenie+Beanie&subset=latin" rel="stylesheet" type="text/css" media="all" />
	<link href="<?php echo site_url('styles/default.css'); ?>" rel="stylesheet" type="text/css" media="all" />
	<!--[if IE]><link href="<?php echo site_url('styles/default.ie.css'); ?>" rel="stylesheet" type="text/css" media="all" /><![endif]-->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" type="text/javascript" charset="utf-8"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.18/jquery-ui.min.js" type="text/javascript" charset="utf-8"></script>
	<script src="<?php echo site_url('scripts/jquery.json.js'); ?>" type="text/javascript" charset="utf-8"></script>
	<script type="text/javascript">
		var 
		ROOT = '<?php echo site_url(); ?>',
		noteMaxLength = <?php echo get_option('max_note_length'); ?>;
	</script>
	<script src="<?php echo site_url('scripts/default.js'); ?>" type="text/javascript" charset="utf-8"></script>
</head>
<body>

<div id="site">

<?php if(logged_in() === TRUE): ?>

	<div id="header_wrap">

		<div id="header">
		
			<div id="logo">
				<a href="<?php echo site_url(); ?>">
					<img src="<?php echo site_url('assets/images/bstruct_logo_beta.png'); ?>" alt="bStruct.com" />
				</a>
			</div><!-- #logo -->
		
			<ul id="menu">
				<li<?php if($selected == 'dashboard') echo ' class="selected"'; ?>>
					<a href="<?php echo site_url(); ?>"><?php echo lang('dashboard_menu_dashboard'); ?></a>
					<?php 
					
					if($dashboards !== FALSE): 
					
						if(count($dashboards) > 1)
						{
							echo '<ul class="submenu">' . "\n";
						
							foreach($dashboards as $dashboard):
							
								echo '<li><a href="' . site_url("dashboard/{$dashboard->id}") . '">' . $dashboard->dashboard_title . '</a></li>' . "\n";
							
							endforeach;
							
							echo '<li><a href="' . site_url('dashboards') . '" class="light">' . lang('dashboard_menu_dashboard_overview') . '</a></li>' . "\n";
							
							echo '</ul>' . "\n";
						}
					
					endif; 
					
					?>
				</li>
				<li<?php if($selected == 'settings') echo ' class="selected"'; ?>>
					<a href="<?php echo site_url('settings'); ?>"><?php echo lang('dashboard_menu_settings'); ?></a>
				</li>
				<li>
					<a href="<?php echo site_url('signout'); ?>"><?php echo lang('dashboard_menu_signout'); ?></a>
				</li>
			</ul><!-- #menu -->
				
		</div><!-- #header -->
		
	</div><!-- #header_wrap -->
	
	<div id="dashboard">
	
<?php endif; ?>