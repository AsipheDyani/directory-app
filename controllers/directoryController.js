const path = require("path");
const os = require("os");
const { Readable } = require("stream");
const readdirp = require("readdirp");
const JSONStream = require("JSONStream");

const homeDir = os.homedir();

console.log("asiphe: ", homeDir);

const directoryName = "asiphe";

const directoryPath = path.join(homeDir, directoryName);

const getDirectoryListings = (directoryPath) => {
  const readableStream = new Readable({ objectMode: true });

  const directoryStream = readdirp(directoryPath, {
    type: "all",
    alwaysStat: true,
  });

  directoryStream.on("data", (entry) => {
    const { basename, fullPath, stats } = entry;
    const isDirectory = stats.isDirectory();
    const size = stats.size;
    const createdDate = stats.birthtime;

    const fileInfo = {
      name: basename,
      path: fullPath,
      isDirectory,
      size,
      createdDate,
    };

    const jsonString = JSON.stringify(fileInfo);

    readableStream.push(jsonString);
  });

  directoryStream.on("end", () => {
    readableStream.push(null);
  });

  directoryStream.on("error", (err) => {
    console.error("Error reading directory:", err);
    readableStream.push(null);
  });

  readableStream._read = () => {};

  return readableStream;
};

const directoryController = (req, res) => {
  try {
    const directoryStream = getDirectoryListings(directoryPath);

    res.setHeader("Content-Type", "application/json");

    directoryStream.pipe(JSONStream.stringify()).pipe(res);
  } catch (err) {
    console.error("Error reading directory:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = directoryController;
