module.exports = runDumpingCLI;

const fileUtils = require("../../utils/files");
const firebaseUtils = require("../../utils/firebase");
const prompt = require("../../utils/prompt");
const colors = require("colors");

function runDumpingCLI() {
  let collectionName;
  return firebaseUtils
    .chooseFirebaseProject()
    .then(() => chooseCollection())
    .then(selectedCollectionName => {
      collectionName = selectedCollectionName;
      return exportCollection(collectionName);
    })
    .then(documents => {
      return saveToFile(collectionName, documents);
    });
}

function chooseCollection() {
  console.log("Fetching collections list...");
  const firestoreUtils = require("../../utils/firestore");
  return firestoreUtils.getCollectionList().then(collections => {
    const selectedIndex = prompt.select(`Which collection do you want to dump?`, collections);
    let collection = collections[selectedIndex];
    return collection;
  });
}

function exportCollection(collectionName) {
  console.log("Fetching documents...");
  const parsers = require("../../utils/encoders");
  const firestoreUtils = require("../../utils/firestore");

  return firestoreUtils.getCollection(collectionName).then(collection => {
    console.log("Encoding documents...");
    return parsers.encodeCollectionToJson(collection);
  });
}

function saveToFile(fileName, data) {
  let filename = fileName + ".json";
  console.log("Writing file...");
  return fileUtils.writeExportFile(filename, data).then(() => {
    console.log(colors.green(`Successfully saved dump file.`));
  });
}
