<?php

 $index = $_GET['index'];
 $file = './graph-data'.$index.'/graph-delLinkAtGraph.txt';
 $ret = file_get_contents($file);


echo($ret);
?>