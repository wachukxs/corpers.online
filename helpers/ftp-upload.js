const dotenv = require("dotenv").config(); // useful / necessary?
const ftp = require("basic-ftp");

const crypto = require("crypto");

const client = new ftp.Client();
// client.ftp.verbose = true; // maybe only set on prod?

const ftpOptions = {
  host: process.env.FTP_SERVER,
  user: process.env.FTP_USERNAME,
  password: process.env.FTP_PASSWORD,
  secure: process.env.NODE_ENV === "production",
};
async function init() {
  try {
    await client.access(ftpOptions);
    // console.log(await client.list());
  } catch (err) {
    // let's throw the error?
    console.log(err);
  } finally {
    client.close(); // should we close?
  }
}

// init() // don't think we need this (here)

/**
 * Not sure if stream works. Don't think it does.
 * @param {*} streamOrFileData
 * @param {*} fileNameOrExtension
 * @returns
 */
exports.uploadFile = async (streamOrFileData, fileNameOrExtension) => {
  try {
    // check if ftp connection is still open.
    if (client.closed) {
      await client.access(ftpOptions);
    }
    const fileExtension = fileNameOrExtension.split(".").pop();
    /**
     * https://stackoverflow.com/a/27747377/9259701
     *
     * TODO: later, change 20 to 25.
     * For longer name - so we don't (eventually) get same name/value.
     */
    const file_name =
      crypto.randomBytes(20).toString("hex") + `.${fileExtension}`;
    await client
      .uploadFrom(streamOrFileData, file_name)
      .finally(() => client.close());

    return `${process.env.FTP_UPLOAD_PATH}/${file_name}`;
  } catch (error) {
    console.log('UPLOAD ERROR:', error);
  }
};
