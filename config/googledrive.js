const fs = require("fs");
const readline = require("readline");
const path = require("path");
const { google } = require("googleapis");
const { db } = require("./mongodb");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/drive"];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

// Load client secrets from a local file.
const runCommad = (callback, props) => {
  const pathKey = path.join(__dirname, "keydriver.json");
  console.log(pathKey);
  fs.readFile(pathKey, (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    // Authorize a client with credentials, then call the Google Drive API.
    authorize(JSON.parse(content.toString()), callback, props);
  });
};

function authorize(credentials, callback, props) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  const pathToken = path.join(__dirname, TOKEN_PATH);
  fs.readFile(pathToken, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token.toString()));
    callback(oAuth2Client, props);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

const uploadFile = async (auth, props) => {
  const drive = google.drive({ version: "v3", auth });
  const folderId = "1BQMbKXvUiXfTUNHf8MVliT0XDH25xoY3";
  const filename = props.filename;
  const filepath = props.filepath;
  const tracksDrive = await db.collection("TracksDrive").findOne({
    filename: filename,
  });
  if (tracksDrive != null) {
    console.log("Track has existed google driver !");
    return;
  }
  var fileMetadata = {
    name: `${filename}`,
    parents: [folderId],
  };
  var media = {
    mimeType: "audio/mp3",
    body: fs.createReadStream(filepath),
  };
  drive.files.create(
    {
      resource: fileMetadata,
      media: media,
      fields: "id",
    },
    async function (err, file) {
      if (err) {
        // Handle error
        console.error(err);
      } else {
        if (file.status == 200) {
          await db.collection("TracksDrive").insertOne({
            filename: filename,
          });
        }
        console.log("Status: ", file.status);
      }
    }
  );
};

module.exports = {
  runCommad,
  uploadFile,
};
