<?php
require_once('t/test.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Wer</title>
</head>
<body>

<p>
Hello visitor, you have seen this page <?php echo $_SESSION['count']; ?> times.
</p>

<p>
To continue, <a href="nextpage.php?<?php echo ''; ?>">click
here</a>.
</p>

<?php

print_r($_COOKIE);
echo 'derrre' ;
require_once('../phps/online.php');
?>

</body>
</html>