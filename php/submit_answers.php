<?php
$id = $_POST['id'];
$answers = $_POST['answers'];

 $file = './user-input'.$id.'.txt';
 $existing = file_get_contents($file);
 $jsonAnswers = json_encode($answers);
 $output = $existing . $jsonAnswers; 

/*foreach($jsonAnswers as $key => $value)
 {
 	/*
 	$tempArray = [
 					'qid' => 1,
 					'time' => 2 
 					];
 	array_push($dataArray, $tempArray); 
 
 } */ 
 /*$ret = file_put_contents($file, json_encode($answers, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP)); */
 $ret = file_put_contents($file, $output);


/*$output = shell_exec($command);*/

echo($ret);
?>