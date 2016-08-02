<?php

 $index =  $_GET['index'];
 $file = './graph-data'.$index.'/graph-answer.txt';
 $ret = file_get_contents($file);


echo($ret);
?>