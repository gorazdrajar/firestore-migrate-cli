module.exports = runDeployCLI;

const prompt = require("../../utils/prompt");
const colors = require("colors");

let db;

function runDeployCLI() {
  const firebaseUtils = require("../../utils/firebase");
  //   const dumpedCollections = readDumpFile();
  return firebaseUtils
    .chooseFirebaseProject()
    .then(firestore => {
      db = firestore;
      return readDumpFile();
    })
    .then(collections => {
      return deployCollections(collections);
    })
    .then(() => {});
}

function readDumpFile() {
  const encodedCollections = prompt.file("Enter database dump filename and relative path:", "json");
  if (encodedCollections === undefined) {
    return readDumpFile();
  }
  let parsers = require("../../utils/encoders");
  return parsers.decodeJsonFormat(encodedCollections);
}

function deployCollections(collections) {
  let mergeOrUpdate = prompt.select(
    "Do you want to 'set with merge', 'set without merge' or 'update' documents in Firestore?",
    ["Set with merge", "Set without merge", "Update"]
  );
  let collectionWritePromises = [];
  collections.forEach(collection =>
    collectionWritePromises.push(
      deployData(
        collection.getName(),
        collection.getDocuments(),
        mergeOrUpdate == 0,
        mergeOrUpdate == 2
      )
    )
  );
  return Promise.all(collectionWritePromises);
}

function deployData(collectionName, documents, merge = true, update = false) {
  let writeBatches = [db.batch()];
  let currentBatch = 0;

  Object.keys(documents).forEach((documentId, index) => {
    if (currentBatch < Math.floor((index + 1) / 500)) {
      currentBatch = Math.floor((index + 1) / 500);
      writeBatches.push(db.batch());
    }
    const document = documents[documentId];
    const docRef = db.collection(collectionName).doc(documentId);
    if (update) {
      writeBatches[currentBatch].update(docRef, document);
    } else {
      writeBatches[currentBatch].set(docRef, document, { merge });
    }
  });

  const writePromises = writeBatches.map(batch => batch.commit());
  return Promise.all(writePromises).then(() =>
    console.log(colors.green(`Successfully written '${collectionName}' collection.`))
  );
}
