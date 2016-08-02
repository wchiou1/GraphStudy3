<?php
$name = $_POST['nodes'];

 $file = './statsWithin.txt';
 $existing = file_get_contents($file);
 $jsonAnswers = json_encode($name);
 $output = $existing . $jsonAnswers;


 $ret = file_put_contents($file, $output);


echo($ret);
?>