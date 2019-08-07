/* image/gif                             gif;
    image/jpeg                            jpeg jpg;
    image/png                             png;
    image/tiff                            tif tiff;
    image/vnd.wap.wbmp                    wbmp;
    image/x-icon                          ico;
    image/x-jng                           jng;
    image/x-ms-bmp                        bmp;
    image/svg+xml                         svg;
    image/webp                            webp;


    video/3gpp                            3gpp 3gp;
    video/mpeg                            mpeg mpg;
    video/quicktime                       mov;
    video/x-flv                           flv;
    video/x-mng                           mng;
    video/x-ms-asf                        asx asf;
    video/x-ms-wmv                        wmv;
    video/x-msvideo                       avi;
    video/mp4                             m4v mp4;
 */


 // https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
 
// call all the required packages
const acceptedfiles = ['image/gif', 'image/jpeg', 'image/png', 'image/tiff', 'image/vnd.wap.wbmp', 'image/x-icon','image/x-jng', 'image/x-ms-bmp', 'image/svg+xml' ,'image/webp', 'video/3gpp', 'video/mpeg', 'video/mp4', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-ms-asf', 'video/x-mng', 'video/x-flv', 'video/quicktime'];
const express = require('express')
const bodyParser= require('body-parser')
const multer = require('multer');
//CREATE EXPRESS APP
const app = express();
app.use(bodyParser.urlencoded({extended: true}))

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('THE FILE', file)
        if (acceptedfiles.includes(file.mimetype)) {
          cb(null, './test/')
        } /* else { // try to catch this error and show it to the user, for now we're just ignoring unacceptable files
          err = new Error('file not accepted')
          cb(err, './test/')
        } */
      
    },
    filename: function (req, file, cb) {
        
      cb(null, Date.now() + file.originalname.slice(file.originalname.lastIndexOf('.'))) // get the file extension of the file you want to copy plus the '.' char 
    }
  })
   
  var upload = multer({ storage: storage })
//ROUTES WILL GO HERE
app.get('/', function(req, res) {
    // res.json({ message: 'WELCOME' });
    res.sendFile(__dirname + '/upload.html'); 
});


 
app.listen(3000, () => console.log('Server started on port 3000'));

app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
    const file = req.file
    if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }
      res.send(file)
    
  })

//Uploading multiple files
app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
  console.log('done', [...new Set(req.files.map(x => x.filename))]) // req.files[0].filename
    const files = req.files
    if (!files) {
      const error = new Error('Please choose files')
      error.httpStatusCode = 400
      return next(error)
    }
   
      res.send(files)
    
  })