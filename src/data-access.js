var schemas = require('./schemas')
  , orgConfig = require('./organization-config')
  , request = require('request')
  , _ = require('underscore');

function cleanDoc (doc) {
  var cleaned = _.extend({}, doc);
  if (doc.id) cleaned.id = doc._id;
  delete cleaned._id;
  delete cleaned._rev;
  delete cleaned._attatchments;
  return cleaned;
}

function cleanKeywords (doc) {
  if (!doc.Keywords) doc.Keywords = [];
  _.each(doc.Keywords, function (keyword) {
    if (keyword.split(',').length > 1) {
      return doc.Keywords = _.union(doc.Keywords, keyword,split(','));
    } else if (keyword.split(';').length > 1) {
      return doc.Keywords = _.union(doc.Keywords, keyword.split(';'));
    }
  });

  doc.Keywords = _.map(doc.Keywords, function (keyword) {
    return keyword.toLowerCase().trim();
  });

  doc.Keywords = _.reject(doc.Keywords, function (keyword) {
    return keyword === ''
      || keyword.indexOf(',') !== -1
      || keyword.indexOf(';') !== -1;
  });

  return doc;
}

// Create a single document in the database
function createDoc (db, options) {
  options.data = options.data !== null ? options.data : {};
  options.success = options.success !== null ? options.success : function () {};
  options.error = options.error !== null ? options.error : function () {};

  // We might need to call 'cleanKeywords()' here

  function results (err, response) {
   if (err) {
     return options.error(err);
   } else {
     return options.success(response);
   }
  }

  if (options.id) {
    return db.instert
  }
}

// Create multiple documents in the given database
function createDocs (dbModel, options) {
  if (!options.docs) options.docs = [];
  if (!options.success) options.success = function () {};
  if (!options.error) options.error = function () {};

  options.docs = _.map(options.docs, cleanKeywords);

  // Use Mongo's model.create() method to do bulk uploads of data
  dbModel.collection.insert(options.docs, function (err, response) {
    if (err) {
      return options.error(err)
    } else {
      return options.success(response);
    }
  });
}

// Retrieve a document by it's ID from a given database
function getDoc (db, options) {

}

// Check that a document exists in a given database
function exists (db, options) {

}

// Return the revision ID for a specific document from a given database
function getRev (db, options) {

}

// List all documents in a given database
function listDocs (db, options) {

}

// Pass all or specific documents through a specified database view
function viewDocs (db, options) {
  var params;
  if (!options.design) options.design = '';
  if (!options.format) options.format = '';
  if (!options.clean_docs) options.clean_docs = false;
  if (!options.success) options.success = function () {};
  if (!options.error) options.error = function () {};

  params = {};
  if (options.key) params.key = options.key;
  if (options.keys) params.keys = options.keys;
  if (options.reduce) params.reduce = options.reduce;

}

// Delete a document
function deleteDoc (db, options) {

}

// Delete an attachment
function deleteFile (db, options) {

}

// Get collection names
function getCollectionNames (options) {

}

// Validate data
function validateRecord (data, resourceType) {

}

// Perform a search
function search (searchUrl, options) {

}

exports.createDoc = createDoc;
exports.createDocs = createDocs;
exports.getDoc = getDoc;
exports.exists = exists;
exports.getRev = getRev;
exports.listDocs = listDocs;
exports.viewDocs = viewDocs;
exports.deleteDoc = deleteDoc;
exports.deleteFile =deleteFile;
exports.getCollectionNames = getCollectionNames;
exports.validateRecord = validateRecord;
exports.search = search;