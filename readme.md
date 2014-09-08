### MongoDB Metadata Server

Server and algorithms implemented in JavaScript and node.js for harvesting and 
processing metadata from **CSV**, **ISO.xml**, **Atom.xml** and **FGDC.xml** 
sources and serving out metadata in **ISO.xml**, **Atom.xml**, **JSON** and 
**GeoJSON** formats.

#### Dependencies
* [MongoDB v2.6.4](http://www.mongodb.org/)
* [Node.js v0.10.29 64-bit](http://nodejs.org/)
* [npmjs v1.4.16](https://www.npmjs.org/)

#### Installation
MongoDB should be running at this point.
```
$ git clone https://github.com/usgin/mongo-metadata-server.git
$ cd mongo-metadata-server
$ npm install
```

#### Start the server
By default, the metadata server will run on localhost port 3000.
```
$ cd mongo-metadata-server
$ node server.js
```

#### Tests
By default, the tests will run on localhost port 3030.  Run the tests with 
[mocha](https://visionmedia.github.io/mocha/):
```
$ cd mongo-metadata-server
$ mocha test
```

#### REST API
Built on top of the [expressjs](http://expressjs.com/) web application 
framework.  Have a look at the 
[tests](https://github.com/usgin/mongo-metadata-server/tree/master/test) for 
actual code samples and example data.

##### POST /metadata/record
Harvest csv, iso.xml, fgdc.xml or atom.xml documents into MongoDB.  Raw harvest
documents get stored in the `harvest` collection and get stored in the `record`
collection after successfully passing through algorithms which standardize the 
data according to our schema.

*User story: I want to harvest one or more hosted metadata documents into 
MongoDB.*

Request:
```
{
  "inputFormat": "csv"|"iso.xml"|"fgdc.xml"|"atom.xml",
  "recordUrl": "http://localhost:3030/path-to-document"
}
```
Response:
* **200** if harvested documents are successfully harvested, processed and 
stored in MongoDB.
* **500** for any kind of error.

##### POST /metadata/record
Create a single, schema-compliant metadata document from a hosted JSON source.
The document will be stored in the `record` collection if it passes schema
validation.

*User story: I have a single JSON metadata document that I want to store in 
MongoDB.*

Request:
```
{
  "url": 'http://localhost:3030/my-metadata-doc.json'
  "json": true
}
```
Response:
* **200** if document passes schema validation and gets stored in MongoDB.
* **500** for any kind of error.

##### GET

##### PUT