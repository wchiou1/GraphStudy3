<?php
$id = $_POST['id'];
$nodes = $_POST['node'];


mkdir('./graph-data'.$id);
 $file = './graph-data'.$id.'/graph-nodes.txt';

 $existing = file_get_contents($file);
 $jsonNodes = json_encode($nodes);
 $output = $existing . $jsonNodes;

  $ret = file_put_contents($file, $output);


echo($ret);
?>