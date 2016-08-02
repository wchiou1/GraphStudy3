<?php

 $index = $_GET['index'];
 $file = './graph-data'.$index.'/graph-locs.txt';
 $ret = file_get_contents($file);


echo($ret);
?>