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