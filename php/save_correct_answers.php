<?php
$data = $_POST['data'];

 $file = './correct-answers.txt';
 $current = file_get_contents($file);
 $jsonData = json_encode($data);
 $output = $current . $jsonData;

  $ret = file_put_contents($file, $output);


/*$output = shell_exec($command);*/

echo($ret);
?>