<?php
$name = $_POST['link'];

 $file = './graph-links.txt';

 $existing = file_get_contents($file);
 $jsonLinks = json_encode($name);
 $output = $existing . $jsonLinks;

  $ret = file_put_contents($file, $output);
echo($ret);
?>