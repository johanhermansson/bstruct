<?php 

if($todos):

	echo "	<!-- To do lists -->\n";

	foreach($todos as $todo): 
	
		todo($todo);
	
	endforeach;
	
endif;


if($notes):

	echo "	<!-- Notes -->\n";
	
	foreach($notes as $note):
	
		note($note);
	
	endforeach;
	
endif;


if($structs):

	echo "	<!-- Structs -->\n";
	
	foreach($structs as $struct):
	
		struct($struct);
	
	endforeach;
	
endif;

