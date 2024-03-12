## File upload
* The way we handle file upload is writing to disk first, then uploading that via FTP.
Reading the stream directly doesn't work. The call backs don't wait for the steam.
I figured this out by going through code samples on GitHub.