<?php

 /*$file = './graph-data/graph-nodes.txt';*/
 $index =$_GET['index'];
 $file = './graph-data'.$index.'/graph-nodes.txt';
 $ret = file_get_contents($file);


echo($ret);
?>