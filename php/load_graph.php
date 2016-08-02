<?php

 $index =$_GET['index'];
 $file = $_GET['file'];

 $ret = file_get_contents($file);

/*$file = './graph-data'.$index.'/graph-nodes.txt';*/
echo($ret);
?>