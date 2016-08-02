<?php

 /*$file = './graph-data/graph-nodes.txt';*/
 $index =$_GET['index'];
 $file = './retPineal.json';
 /*$file = './fmri_nodes.json';*/
 $ret = file_get_contents($file);


echo($ret);
?>