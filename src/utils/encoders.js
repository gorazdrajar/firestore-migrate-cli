module.exports = {
  encodeCollectionToJson,
  encodeToJson,
  decodeJsonFormat,
};

const firebase = require("firebase-admin");

function encodeCollectionToJson(collection) {
  let documents = collection.getDocuments();
  let collectionName = collection.getName();

  let documentsData = {};
  Object.keys(documents).forEach(key => {
    documentsData[key] = encodeToJson(documents[key]);
  });
  let encodedCollection = {
    data: {
      [collectionName]: {
        data: documentsData,
        type: "documents",
      },
    },
    type: "collections",
  };
  return encodedCollection;
}

function encodeToJson(data) {
  const type = determineDecodedDataType(data);
  switch (type) {
    case "number":
    case "string":
    case "boolean": {
      return { data, type };
    }
    case "timestamp": {
      return { data: data.toDate ? data.toDate().toISOString() : data.toISOString(), type };
    }
    case "geopoint": {
      return { data: { lat: data.latitude, lng: data.longitude }, type };
    }
    case "reference": {
      return { data: data.path, type };
    }
    case "map": {
      let map = {};
      Object.keys(data).forEach(key => {
        map[key] = encodeToJson(data[key]);
      });
      return { data: map, type };
    }
    case "array": {
      let array = [];
      data.forEach(element => {
        array.push(encodeToJson(element));
      });
      return { data: array, type };
    }
    default: {
      return { data, type };
    }
  }
}

function decodeJsonFormat(encodedData) {
  if (encodedData === undefined) {
    throw new Error("No data passed to decoder.");
  }
  switch (encodedData.type) {
    case "number":
    case "string":
    case "null":
    case "boolean": {
      return encodedData.data;
    }
    case "timestamp": {
      return new Date(encodedData.data);
    }
    case "geopoint": {
      let { lat, lng } = encodedData.data;
      return new firebase.firestore.GeoPoint(lat, lng);
    }
    case "reference": {
      let reference;
      if (firebase.apps.length > 0) {
        reference = firebase.firestore().doc(encodedData.data);
      } else {
        const OfflineDocumentReference = require("../classes/OfflineDocumentReference");
        reference = new OfflineDocumentReference(encodedData.data);
      }
      return reference;
    }
    case "collections": {
      let collections = [];
      let Collection = require("../classes/Collection");
      Object.keys(encodedData.data).forEach(collectionName => {
        collections.push(
          new Collection(collectionName, decodeJsonFormat(encodedData.data[collectionName]))
        );
      });
      return collections;
    }
    case "documents": {
      let documents = {};
      Object.keys(encodedData.data).forEach(documentId => {
        documents[documentId] = decodeJsonFormat(encodedData.data[documentId]);
      });
      return documents;
    }
    case "map": {
      let map = {};
      Object.keys(encodedData.data).forEach(key => {
        map[key] = decodeJsonFormat(encodedData.data[key]);
      });
      return map;
    }
    case "array": {
      let array = [];
      encodedData.data.forEach(element => {
        array.push(decodeJsonFormat(element));
      });
      return array;
    }
    default: {
      throw new Error(
        `An element's 'type' field has value of '${encodedData.type}' which is not a recognized data type. Passing raw data on.`
      );
    }
  }
}

// non-exported helpers

function determineDecodedDataType(data) {
  if (typeof data === "number") return "number";
  if (typeof data === "string") return "string";
  if (typeof data === "boolean") return "boolean";
  if (data === null) return "null";
  if (data.constructor.name === "Timestamp" || data.constructor.name === "Date") return "timestamp";
  if (
    data.constructor.name === "DocumentReference" ||
    data.constructor.name === "OfflineDocumentReference"
  )
    return "reference";
  if (data.constructor.name === "Collection") return "collection";
  if (data.constructor.name === "GeoPoint") return "geopoint";
  if (Array.isArray(data)) return "array";
  if (Object.prototype.toString.call(data) === "[object Object]") return "map";
  return null;
}

function validateCollections(collections) {
  return (
    typeof collections === "object" &&
    !(collections instanceof Array) &&
    Object.keys(collections).length &&
    collections.type === "collections"
  );
}
