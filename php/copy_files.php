<?php
  $src = $_GET['src'];
  $dst = $_GET['dst'];

  mkdir('./Scenarios/graph-data'.$dst);
  $fileS = './Original/graph-data'.$src.'/graph-nodes.txt';
  $fileD = './Scenarios/graph-data'.$dst.'/graph-nodes.txt';

  if (!copy($fileS, $fileD)) {
    echo "failed to copy $file...\n";
    }


    $fileS = './Original/graph-data'.$src.'/graph-links.txt';
    $fileD = './Scenarios/graph-data'.$dst.'/graph-links.txt';

    if (!copy($fileS, $fileD)) {
    echo "failed to copy $file...\n";
    }

    $fileS = './Original/graph-data'.$src.'/graph-labels.txt';
    $fileD = './Scenarios/graph-data'.$dst.'/graph-labels.txt';

    if (!copy($fileS, $fileD)) {
    echo "failed to copy $file...\n";
    }

    $fileS = './Original/graph-data'.$src.'/graph-locs.txt';
    $fileD = './Scenarios/graph-data'.$dst.'/graph-locs.txt';

    if (!copy($fileS, $fileD)) {
     echo "failed to copy $file...\n";
    }

    $fileS = './Original/graph-data'.$src.'/graph-delNodes.txt';
    $fileD = './Scenarios/graph-data'.$dst.'/graph-delNodes.txt';

    if (!copy($fileS, $fileD)) {
    echo "failed to copy $file...\n";
    }

    $fileS = './Original/graph-data'.$src.'/graph-delLinks.txt';
    $fileD = './Scenarios/graph-data'.$dst.'/graph-delLinks.txt';

    if (!copy($fileS, $fileD)) {
    echo "failed to copy $file...\n";
    }

    $fileS = './Original/graph-data'.$src.'/graph-delAtGraph.txt';
    $fileD = './Scenarios/graph-data'.$dst.'/graph-delAtGraph.txt';

    if (!copy($fileS, $fileD)) {
    echo "failed to copy $file...\n";
    }

    $fileS = './Original/graph-data'.$src.'/graph-delLinkAtGraph.txt';
    $fileD = './Scenarios/graph-data'.$dst.'/graph-delLinkAtGraph.txt';

    if (!copy($fileS, $fileD)) {
    echo "failed to copy $file...\n";
    }

    $fileS = './Original/graph-data'.$src.'/graph-answer.txt';
    $fileD = './Scenarios/graph-data'.$dst.'/graph-answer.txt';

    if (!copy($fileS, $fileD)) {
    echo "failed to copy $file...\n";
    }
?>