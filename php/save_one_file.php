<?php
$id = $_POST['id'];
$nodes = $_POST['node'];

  $file = './graph-one-file'.$id.'.json';
  $existing = file_get_contents($file);
  $jsonNodes = json_encode($nodes);
  $output = $existing . $jsonNodes;

  $ret = file_put_contents($file, $output);

echo($ret);
?>