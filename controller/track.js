const ydl = require("youtube-dl-exec");
const path = require("path");
const fs = require("fs");
const { runCommad, uploadFile } = require("../config/googledrive");

const handeGetTrack = async (req, res, next) => {
  const query = req.query;

  if (query.link == undefined) {
    return res.send({
      status: false,
      message: "Not found link !",
    });
  }

  var link = "https://www.youtube.com/watch?v=" + query.link;

  const filename = query.link + ".mp3";
  const filePath = path.join(__dirname.replace("\\controller", "") + "/track", filename);

  //handle check file name has existd
  var tracksName = await fs.readdirSync(path.join(__dirname.replace("\\controller", "") + "/track"));
  if (tracksName.includes(filename) == false) {
    const driverPath = path.join(__dirname.replace("\\controller", "") + "/driver", "ffmpeg.exe");
    await ydl(link, {
      extractAudio: true,
      audioFormat: "mp3",
      output: filePath,
      referer: query.link,
      ffmpegLocation: driverPath,
    });
    const props = {
      filename: filename,
      filepath: filePath,
    };
    runCommad(uploadFile, props);
  }

  const stat = fs.statSync(filePath);
  const readStream = fs.createReadStream(filePath);

  res.writeHead(200, {
    "Content-Type": "audio/mp3",
    "Content-Length": stat.size,
  });

  readStream.pipe(res, { end: false });
};

module.exports = {
  handeGetTrack,
};
