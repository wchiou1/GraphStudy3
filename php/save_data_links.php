<?php
$id = $_POST['id'];
$name = $_POST['link'];

 $file = './graph-data'.$id.'/graph-links.txt';
 $ret = file_put_contents($file, json_encode($name, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP));


echo($ret);
?>