const admin = require("firebase-admin");
const Collection = require("../classes/Collection");
const db = admin.firestore();

module.exports = {
  getCollectionList,
  getCollection,
};

function getCollectionList() {
  return db.listCollections().then(collections => {
    return collections.map(collection => collection.id);
  });
}

function getCollection(collectionName) {
  return db
    .collection(collectionName)
    .get()
    .then(snapshot => {
      let documents = {};
      snapshot.docs.forEach(doc => (documents[doc.id] = doc.data()));
      return new Collection(collectionName, documents);
    });
}

// non-exported helpers
