const colors = require("colors");
const fs = require("fs");
const path = require("path");

module.exports = { readFile, writeFile, writeExportFile, readFolder };

function readFile(filePath, format) {
  const absPath = ROOT_DIR + "\\" + filePath;
  let fileData;
  try {
    fileData = require("fs").readFileSync(absPath, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(colors.red("File doesn't exist: ", path.normalize(absPath)));
    } else {
      console.log(colors.red("An error occured: ", err));
    }
    return undefined;
  }
  if (format) {
    try {
      fileData = parseFile(fileData, format);
    } catch (err) {
      console.log(colors.red(err.message));
      return undefined;
    }
  }
  return fileData;
}

function writeFile(filePath, data) {
  ensureDirectoryExistence(filePath);
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data), "utf8", function(err) {
      if (err) {
        console.log(colors.red("An error occured while writing to file: " + err));
        reject(err);
      }
      console.log(colors.green(`File was successfully created "${path.normalize(filePath)}"`));
      resolve(filePath);
    });
  });
}

function writeExportFile(filePath, data) {
  let exportsPath = ROOT_DIR + `\\exports\\${filePath}`;
  return writeFile(exportsPath, data);
}

function readFolder(folderPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, function(err, files) {
      //handling error
      if (err) {
        console.log(colors.red(`Unable to scan directory '${path.normalize(folderPath)}': ${err}`));
        reject(err);
      }
      //listing all files using forEach
      resolve(files);
    });
  });
}

// non-exported helpers

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function parseFile(data, format) {
  switch (format) {
    case "json": {
      try {
        let content = JSON.parse(data);
        return content;
      } catch (err) {
        throw new Error(`JSON failed to parse - file contents are not in JSON format.`);
      }
    }
    default: {
      throw new Error(`Unknown format requested for parsing - '${format}'`);
    }
  }
}
