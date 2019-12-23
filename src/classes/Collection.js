class Collection {
  constructor(name, documents = {}) {
    this._name = name;
    this._documents = documents;
  }
  getName() {
    return this._name;
  }
  getDocuments() {
    return this._documents;
  }
  getSize() {
    return this._documents.length;
  }
  setDocuments(documents) {
    this._documents = documents;
  }
  setName(name) {
    this._name = name;
  }
  toString() {
    //TODO
  }
}

module.exports = Collection;
