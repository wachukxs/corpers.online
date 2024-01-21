const fs = require('fs');
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const _FILENAME = path.basename(__filename);
/**
 * COMMENT 58:
 * 
 * apparently, path is relative to ./index.js
 * TODO: Use absolute path?
 */

// https://developers.google.com/drive/api/v3/quickstart/nodejs
// https://stackoverflow.com/q/54166810
const readline = require('readline');
const {
  google
} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './google/token.json'; // COMMENT 58

// Load client secrets from a local file.
fs.readFile('./google/credentials.json', (err, content) => { // COMMENT 58
  if (err) {
    console.log('Error loading client secret file:', err);
    return // have fallback here.
  }

  console.log('read GGLE CRED')

  const credentials = JSON.parse(content)

  const {
    client_secret,
    client_id,
    redirect_uris
  } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return // getAccessToken(oAuth2Client); TODO: uncomment to activate google
    oAuth2Client.setCredentials(JSON.parse(token));

    const drive = google.drive({ version: 'v3', auth: oAuth2Client });
    exports.drive = drive;
  });

});


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
    });
  });
}
// 4%2F0AfJohXlJmY-A5m1OUrt6BJiOEXuDYwvcOeSBQC0FMq3nBqr_ZiOg-ntpsifR8Am-Qla6HQ
// LINE 44

exports.uploadFile = async (streamOrFileData, fileName) => {
  let fileMetadata = {
    'name': fileName, // Date.now() + 'test.jpg',
    parents: [process.env.CO_PPICS_GDRIVE]
  };
  let media = {
    mimeType: mimetype,
    body: streamOrFileData
  };
  const up = ggle.drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, thumbnailLink',
  }).then(
    function (file) {

      // maybe send the upload progress to front end with sockets? https://github.com/googleapis/google-api-nodejs-client/blob/7ed5454834b534e2972746b28d0a1e4f332dce47/samples/drive/upload.js#L41

      // console.log('upload File Id: ', file.data.id); // save to db
      // console.log('thumbnailLink: ', file.data.thumbnailLink);
      req.session.corper.picture_id = file.data.id // or we could add picture_id to _profile_data

      connectionPool.query('UPDATE info SET picture_id = ? WHERE state_code = ?', [file.data.id, req.session.corper.state_code.toUpperCase()], function (error, results, fields) {
        if (error) throw error;
        else {
          console.log('updated pic')
        }
      });

    }, function (err) {
      // Handle error
      console.error(err);
    }
  ).catch(function (err) {
    console.error('some other error ??', err)
  }).finally(() => {
    // console.log('upload finally block')
  });
};