<?php
namespace MyApp;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;


####################################################



class Chat implements MessageComponentInterface {
    protected $clients;
    public function __construct() {
        $this->clients = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn) {
        // Store the new connection to send messages to later

        //also send them [recents] posts from other users
        $this->clients->attach($conn);

        echo "New connection! ({$conn->resourceId})\n";

        #var_dump($conn);

    }

    public function onMessage(ConnectionInterface $from, $msg) {
        
        // Create connection
        $con = mysqli_connect("localhost", "connarts_ossai", "ossai'spassword", "connarts_nysc");

        // Check connection
        if (!$con) {
            die("Connection failed: " . mysqli_connect_error());
        }
        echo "Connected to the database successfully\n";

       $data = json_decode($msg, true); //convert it to an array.
        switch ($data['type']) {
            case 'placeData':
                # update the places data in the db

                echo "we're trying to put in data\n" ;
                $sql001 = "SELECT places_data FROM places";
                $result = mysqli_query($con, $sql001);
                if (mysqli_num_rows($result) > 0) {
                    // output data so we can update it.
                    while($row = mysqli_fetch_assoc($result)) {
                        $in = json_decode($row["places_data"], true);
                        #update our data from the db
                        var_dump($in);
                        //error heree
                        var_dump( gettype($in['features']) );
                        //solution is to append to the string
                        array_push($in['features'], $data["placeData"]);
                        #update our db
                        $innnnnnnnn = json_encode($in);
                        echo $innnnnnnnn;
                        $sql = "INSERT INTO places (places_data) VALUES ('$innnnnnnnn')";

                        if (mysqli_query($con, $sql)) {
                            echo "New record updated successfully\n";
                        }
                    }
                }
                
                break;
            
            default:
                # code...
                break;
        }







        #############################################################################
        // what kind of message ? to everyone ? ...a personal private msg ? what ?
        $numRecv = count($this->clients) - 1;
        echo sprintf('Connection %d sending message "%s" to %d other connection%s' . "\n\n"
            , $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');
        var_dump ($data)  ;
        echo "\n" ;
            #now for every message received process it.

            #var_dump($from); put it out in a txt/json file for better understanding!
            #var_dump($msg);
        foreach ($this->clients as $client) {
            if ($from !== $client) {
                // The sender is not the receiver, send to each client connected
                $client->send($msg);
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        // The connection is closed, remove it, as we can no longer send it messages

        //oh well ?!!
        $this->clients->detach($conn);

        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {

        //ouch !!
        echo "An error has occurred: {$e->getMessage()}\n";

        $conn->close();
    }

}