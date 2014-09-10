var express = require('express')
  , params = require('express-params')
  , bodyParser = require('body-parser')
  , errorHandler = require('errorhandler')
  , mongo = require('./mongo-config')
  , routes = require('./routes')
  , errors = require('./errors')
  ;

var server = express();
params.extend(server);
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
server.use(errorHandler({showStack: true, dumpExceptions: true}));

function setParams (req, res, next) {
  switch (req.routeId) {
    case 'search':
      req.searchTerms = req.body.searchTerms;
      req.publishedOnly = req.body.publishedOnly || false;
      if (req.body.limit) req.limit = req.body.limit;
      if (req.body.skip) req.skip = req.body.skip;
      break;
    case 'listResources':
    case 'newResource':
      req.resourceType = req.params.resourceType[0];
      break;
    case 'viewRecords':
      req.format = req.params[0];
      break;
    case 'harvestRecord':
      req.url = req.body.recordUrl;
      req.format = req.body.inputFormat;
      if (req.body.destinationCollections) req.collections = req.body.desinationCollections;
      break;
    case 'uploadRecord':
      if (req.body.destinationCollections) req.collections = req.body.desinationCollections;
      req.format = req.body.format;
      req.data = req.body.data;
      break;
    case 'getResource':
    case 'updateResource':
    case 'deleteResource':
    case 'emptyCollection':
      req.resourceType = req.params.resourceType[1];
      req.resourceId = req.params.resourceId[1];
      break;
    case 'viewRecord':
    case 'viewCollectionRecords':
      req.resourceId = req.params.resourceFormat[1];
      req.format = req.params.resourceFormat[2];
      break;
    case 'listFiles':
    case 'newFile':
    case 'getCollectionRecords':
      req.resourceId = req.params[0];
      break;
    case 'getFile':
    case 'deleteFile':
      req.resourceId = req.params[0];
      req.fileName = req.params[1];
      break;
    case 'getSchema':
      req.schemaId = req.params[0];
      var params = ['resolve', 'emptyInstance'];
      for (var i = 0; i < params.length; i++) {
        if ((req.query[params[i]] != null) && req.query[params[i]] === 'true') {
          req.query[params[i]] = JSON.parse(req.query[params[i]]);
        } else {
          req.query[params[i]] = false;
        }
      }
  }
  return next();
}

server.param(function (name, fn) {
  var captures;
  if (fn instanceof RegExp) {
    return function (req, res, next, val) {
      if (captures = fn.exec(String(val))) {
        req.params[name] = captures;
      } else {
        next('route');
      }
    }
  }
});

server.param('resourceType', /(record|collection|harvest)/);
server.param('resourceId', /([^\/]*)/);
server.param('resourceFormat', /([^\/]*)\.(iso\.xml|atom\.xml|geojson)$/);

// ********
// * POST *
// ********

// Harvest an existing record
server.post('/metadata/harvest', function (req, res, next) {
  req.routeId = 'harvestRecord';
  return next();
}, setParams, routes.harvestRecord, routes.saveRecord);

// Create a new record or collection
server.post('/metadata/:resourceType', function (req, res, next) {
  req.routeId = 'newResource';
  return next();
}, setParams, routes.newResource);

/*
// Text-based search for records
server.post(/^\/metadata\/search\/$/, function (req, res, next) {
  req.routeId = 'search';
  return next();
}, setParams, routes.search);

// Upload an existing record
server.post(/^\/metadata\/upload\/$/, function (req, res, next) {
  req.routeId = 'uploadRecord';
  return next();
}, setParams, routes.uploadRecord, routes.saveRecord);


// Associate a new file with a specific record
server.post(/^\/metadata\/record\/([^\/]*)\/file\/$/, function (req, res, next) {
  req.routeId = 'newFile';
  return next();
}, setParams, routes.newFile);

*/

// *******
// * GET *
// *******
// List records or collections as (JSON)

server.get('/metadata/:resourceType', function (req, res, next) {
  req.routeId = 'listResources';
  return next();
}, setParams, routes.listResources);

// Retrieve a specific record or collection (as JSON)
server.get('/metadata/record/:resourceFormat', function (req, res, next) {
  req.routeId = 'viewRecord';
  return next();
}, setParams, routes.viewRecord);

// Retrieve a specific record in a specific format
server.get('/metadata/:resourceType/:resourceId', function (req, res, next) {
  req.routeId = 'getResource';
  return next();
}, setParams, routes.getResource);


/*

// List records in a specific format
server.get(/^\/metadata\/record\.(iso\.xml|atom\.xml|geojson)$/, function (req, res, next) {
  req.routeId = 'viewRecords';
  return next();
}, setParams, routes.viewRecords);

// Retrieve all the records in a specific collection (as JSON)
server.get(/^\/metadata\/collection\/([^\/]*)\/records\/$/, function (req, res, next) {
  req.routeId = 'getCollectionRecords';
  return next();
}, setParams, routes.getCollectionRecords);

// Retrieve all the records in a specific collection in a specific format
server.get(/^\/metadata\/collection\/([^\/]*)\/records\.(iso.xml|atom\.xml|geojson)$/, function (req, res, next) {
  req.routeId = 'viewCollectionRecords';
  return next();
}, setParams, routes.viewCollectionRecords);

// Retrieve a specific schema by ID
server.get(/^\/metadata\/schema\/([^\/]*)\/$/, function (req, res, next) {
  req.routeId = 'getSchema';
  return next();
}, setParams, routes.getSchema);

// Retrieve a list of schemas used by the server
server.get(/^\/metadata\/schema\/$/, routes.listSchemas);

// List files associated with a specific record
server.get(/^\/metadata\/record\/([^\/]*)\/file\/$/, function (req, res, next) {
  req.routeId = 'listFiles';
  return next();
}, setParams, routes.listFiles);

// Retrieve a specific file associated with a specific record
server.get(/^\/metadata\/record\/([^\/]*)\/file\/(.*)$/, function (req, res, next) {
  req.routeId = 'getFile';
  return next();
}, setParams, routes.getFile);

*/

// *******
// * PUT *
// *******
/*

// Update an existing record or collection
server.put(/^\/metadata\/(record|collection)\/([^\/]*)\/$/, function (req, res, next) {
  req.routeId = 'updateResource';
  return next();
}, setParams, routes.updateResource);

*/

// *******
// * DEL *
// *******

// Delete a record or collection
server.delete('/metadata/:resourceType/:resourceId', function (req, res, next) {
  req.routeId = 'deleteResource';
  return next();
}, setParams, routes.deleteResource);

// Drop a MongoDB collection
server.delete('/metadata/:resourceType', function (req, res, next) {
  req.routeId = 'emptyCollection';
  return next();
}, setParams, routes.emptyCollection);

/*
// Delete a specific file associated with a specific record
server.del(/^\/metadata\/record\/([^\/]*)\/file\/(.*)$/, function (req, res, next) {
  req.routeId = 'deleteFile';
  return next();
}, setParams, routes.deleteFile);
*/

// Error handler for express server
function errorHandler (err, req, res, next) {
  res.send(err.msg. err.status);
  return next(err);
}

server.use(errorHandler);

server.listen(3000);

module.exports = server;