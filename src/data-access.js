var schemas = require('./schemas')
  , atomMapReduce = require('./mapReduce/atom')
  , csvMapReduce = require('./mapReduce/csv')
  , fgdcMapReduce = require('./mapReduce/fgdc')
  , isoMapReduce = require('./mapReduce/iso')
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
function createDoc (dbModel, options) {
  options.data = options.data !== null ? options.data : {};
  options.success = options.success !== null ? options.success : function () {};
  options.error = options.error !== null ? options.error : function () {};

  options.data = cleanKeywords(options.data);

  dbModel.create(options.data, function (err, res) {
    if (err) {
      console.log(err);
      return options.error(err);
    } else {
      return options.success(res);
    }
  })
}

// Create multiple documents in the given database
function createDocs (dbModel, options) {
  if (!options.docs) options.docs = [];
  if (!options.success) options.success = function () {};
  if (!options.error) options.error = function () {};

  options.docs = _.map(options.docs, cleanKeywords);

  dbModel.collection.insert(options.docs, function (err, res) {
    if (err) {
      return options.error(err)
    } else {
      return options.success(res);
    }
  })
}

// Retrieve a document by it's ID from a given database
function getDoc (db, options) {

}

// Check that a document exists in a given database
function exists (db, options) {

}

// List all documents in a given database
function listDocs (dbModel, options) {
  var params
    , ids
    ;

  if (!options.include_docs) options.include_docs = false;
  if (!options.clean_docs) options.clean_docs = false;
  if (!options.success) options.success = function () {};
  if (!options.error) options.error = function () {};

  ids = [];
  dbModel.find({}, function (err, res) {
    if (err) {
      return options.error(err);
    } else {
      _.each(res, function (doc) {
        ids.push(doc._id);
      });
      return options.success(ids);
    }
  })
}

// Pass all or specific documents through a specified database view
function mapReduce (dbModel, options) {
  var thisMapReduce;
  if (!options.format) options.format = '';
  if (!options.query) options.query = '';
  if (!options.clean_docs) options.clean_docs = false;
  if (!options.success) options.success = function () {};
  if (!options.error) options.error = function () {};

  switch (options.format) {
    case 'atom.xml':
      thisMapReduce = atomMapReduce;
      break;
    case 'csv':
      thisMapReduce = csvMapReduce;
      break;
    case 'fgdc.xml':
      thisMapReduce = fgdcMapReduce;
      break;
    case 'iso.xml':
      thisMapReduce = isoMapReduce;
      break;
  }

  var o = {};
  o.map = thisMapReduce.map;
  o.reduce = thisMapReduce.reduce;
  o.query = options.query;

  dbModel.mapReduce(o, function (err, res) {
    if (err) {
      return options.error(err);
    } else {
      return options.success(res);
    }
  })
}

// Delete a single document
function deleteDoc (dbModel, options) {
  var query;
  if (!options.id) options.id = '';
  if (!options.fileName) options.fileName = '';
  if (!options.success) options.success = function () {};
  if (!options.error) options.error = function () {};

  query = { _id: options.id };

  dbModel.remove(query, function (err, res) {
    if (err) {
      return options.error(err);
    } else {
      return options.success(res);
    }
  })
}

// Empty an entire collection
function emptyCollection (dbModel, options) {
  if (!options.id) options.id = '';
  if (!options.fileName) options.fileName = '';
  if (!options.success) options.success = function () {};
  if (!options.error) options.error = function () {};

  dbModel.remove({}, function (err, res) {
    if (err) {
      return options.error(err);
    } else {
      res = 'Deleted ' + res + ' records';
      return options.success(res);
    }
  })
}

// Delete an attachment
function deleteFile (db, options) {

}

// Get collection names
function getCollectionNames (options) {

}

// Perform a search
function search (searchUrl, options) {

}

exports.createDoc = createDoc;
exports.createDocs = createDocs;
exports.getDoc = getDoc;
exports.exists = exists;
exports.listDocs = listDocs;
exports.mapReduce = mapReduce;
exports.deleteDoc = deleteDoc;
exports.deleteFile =deleteFile;
exports.getCollectionNames = getCollectionNames;
exports.search = search;
exports.emptyCollection = emptyCollection;