<?php
$conn = new mysqli('localhost', 'root', 'test123', 'tasks');
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (isset($_GET['id'])) {
    $id = $_GET['id'];
    $sql = "SELECT id, hash, start_time, end_time FROM tasks WHERE id = $id";
} else {
    $sql = "SELECT id, hash, start_time, end_time FROM tasks";
}

$result = $conn->query($sql);

$dbdata = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $dbdata[] = $row;
    }
}

echo json_encode($dbdata);

$conn->close();
?>
