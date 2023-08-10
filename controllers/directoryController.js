const path = require("path");
const os = require("os");
const { Readable } = require("stream");
const readdirp = require("readdirp");
const JSONStream = require("JSONStream");

const homeDir = os.homedir();

const directoryName = "asiphe"; // directory name in the home directory

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

    const permissions = {
      ownerRead: Boolean(stats.mode & 0o400),
      ownerWrite: Boolean(stats.mode & 0o200),
      ownerExecute: Boolean(stats.mode & 0o100),
      groupRead: Boolean(stats.mode & 0o040),
      groupWrite: Boolean(stats.mode & 0o020),
      groupExecute: Boolean(stats.mode & 0o010),
      othersRead: Boolean(stats.mode & 0o004),
      othersWrite: Boolean(stats.mode & 0o002),
      othersExecute: Boolean(stats.mode & 0o001),
    };

    const fileInfo = {
      name: basename,
      path: fullPath,
      isDirectory,
      size,
      createdDate,
      permissions,
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
    const path = req.params.path || directoryPath;
    const directoryStream = getDirectoryListings(path);

    res.setHeader("Content-Type", "application/json");

    directoryStream.pipe(JSONStream.stringify()).pipe(res);
  } catch (err) {
    console.error("Error reading directory:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = directoryController;
