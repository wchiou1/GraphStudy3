<?php
$id = $_POST['id'];
$log = $_POST['log'];

 $file = fopen('./stage_track'.$id.'.txt','a');
 //$jsonLog = json_encode($log);

 //file_put_contents($file, $log, FILE_APPEND);
 fwrite($file, $log);
 fclose($file);

?>