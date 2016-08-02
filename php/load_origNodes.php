<?php

 $index =$_GET['index'];
 $file = './Original/graph-data'.$index.'/graph-nodes.txt';
 $ret = file_get_contents($file);


echo($ret);
?>