<?php
$name = $_GET['name'];
 $file = './user-log.txt';
 $current = file_get_contents($file);
 $current .= $name;
 $ret = file_put_contents($file, $current);

/*$output = shell_exec($command);*/

echo($ret);
?>