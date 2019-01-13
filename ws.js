var socket = new WebSocket("localhost/ajuwaya/socket", ['protocol1', 'protocol2']);

socket.onopen = function (event) {
    socket.send("Here's some text that the server is urgently awaiting!"); 
};

socket.onmessage = function (event) {
    console.log('WebSocket is connected.');
    console.log(event.data);
}

// Handle any error that occurs.
socket.onerror = function(error) {
    console.log('WebSocket Error: ' + error);
};