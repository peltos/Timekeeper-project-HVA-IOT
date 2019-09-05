<?php
header("Access-Control-Allow-Origin: *");

$db_handle = new mysqli('localhost', 'root', 'test123', 'tasks');
if (mysqli_connect_errno()) {
    die("MySQL connection failed: " . mysqli_connect_error());
}

if (isset($_GET['id'])) {
	$id = $_GET['id'];
}

if (isset($_GET['hash'])){
	$hash = $_GET['hash'];
}

if (isset($_GET['tap'])) {
    $tap = $_GET['tap'];
    if ($tap == 'start') {
		$query = "INSERT INTO tasks (id, hash, start_time) VALUES ('" . $id . "', " . $hash . ", CURRENT_TIMESTAMP)";
	}
	if ($tap == 'end') {
		$query = "UPDATE tasks SET end_time=CURRENT_TIMESTAMP WHERE id='" . $id . "' AND hash=" . $hash . "";
	}
} 
echo($query);
$result = $db_handle->query($query);
?>
