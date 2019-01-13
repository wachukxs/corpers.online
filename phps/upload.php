<?php
	session_start();
	ob_start();
?>
<?php
$con = mysqli_connect("localhost", "connarts_ossai", "ossai'spassword", "connarts_nysc");

// A list of permitted file extensions
$allowed = array('png', 'jpg', 'gif','zip');

if(!empty($_FILES['pictureselect']) ){
	
	foreach ($_FILES['pictureselect']['error'] as $key => $error) {
		# code...
		mysqli_query($con,"INSERT INTO ads(name, email) VALUES ('$name', 'did1')");
		if ($error == UPLOAD_ERR_OK) {
			# code...
			$extension = pathinfo($_FILES['pictureselect']['name'][$key], PATHINFO_EXTENSION);
	
			if(!in_array(strtolower($extension), $allowed)){
				#echo '{"status":"error"}';
				http_response_code(406); //"not acceptable" error
				continue;
			}
	
			$tmp_name = $_FILES['pictureselect']['error'][$key];
			$name = basename($_FILES['pictureselect']['name'][$key]);
			$moved_ = move_uploaded_file($tmp_name, 'C:\\xampp\\htdocs\\ajuwaya\\uploads\\'.$name);
			if ($moved_) {
				# code...
				$q = mysqli_query($con,"INSERT INTO ads(name, email) VALUES ('$name', 'john@examp.com')");
				if ($q) {
					# code...
					http_response_code(200); //'yea yea, ok'
					
				} else {
					# code...
					http_response_code(304); //"not modified" error
					
				}
			}
		}
	}

}

#echo '{"status":"error"}';
http_response_code(304); //"not modified" error
exit;

?>
