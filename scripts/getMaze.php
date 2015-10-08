<?php
	$api_key = 'AlgorithmiaApiKeyGoesHere';
	
    $cmd = "curl -X POST -d '{\"width\": " . $_GET['width'] . ", \"height\": " . $_GET['height'] . "}' -H 'Content-Type: application/json' -H 'Authorization: Simple " . $api_key . "' https://api.algorithmia.com/v1/algo/jdkilby/MazeGeneration/0.1.0";
	
	exec($cmd,$result);
	
	$result = $result[0];
	
	$startIndex = strpos($result, 'result') + 8;
	$endIndex = strrpos($result, ']') + 1;
	
	print substr($result, $startIndex, $endIndex - $startIndex);
?>