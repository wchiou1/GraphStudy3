<?php
$name = $_POST['node'];

 $file = './graph-labels.txt';
 $current = file_get_contents($file);
 $current .= $name;
 $ret = file_put_contents($file, json_encode($name, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP));


/*$output = shell_exec($command);*/

echo($ret);
?>