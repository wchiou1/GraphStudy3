<?php

 $index = $_GET['index'];
 $file = './retPineal_links3.json';
 /*$file = './fmri_links.json';*/
 $ret = file_get_contents($file);


echo($ret);
?>