<?php
require __DIR__ . '/../vendor/autoload.php';
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

// here I'll get the subscription endpoint in the POST parameters
// but in reality, you'll get this information in your database
// because you already stored it (cf. push_subscription.php)

$con = mysqli_connect("localhost","connarts_ossai","ossai'spassword","connarts_nysc");

$sql = "SELECT the_endpint FROM endpoints LIMIT 1" ;

$theResult = mysqli_query($con, $sql);
$row = mysqli_fetch_assoc($theResult);
$theENDPOINT = $row["the_endpoint"];
$subscription = Subscription::create($theENDPOINT);

$auth = array(
    'VAPID' => array(
        'subject' => 'https://corpers.online/',
        'publicKey' => 'BPIKimNFUomQVXzOr5Zc09uzcijMV2-5j5T2GxnEUSyhePuOiPRAd45gc-c0mW0TQ51ZFi5e3Adum3qxJivc9xM',
        'privateKey' => 'QOZZVj7CZAzYVZOslCZG7VSUuz2A2C9H5m1Qtx9JqD0', // in the real world, this would be in a secret file
    ),
);

$webPush = new WebPush($auth);

$res = $webPush->sendNotification(
    $subscription,
    "Hello!",
    true
);

// handle eventual errors here, and remove the subscription from your server if it is expired
