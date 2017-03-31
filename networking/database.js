var unzip = require("unzip");
var bungieRequest = require(".");
var manifest = require("../data/manifest");

var database = {};

database.downloadDatabase = function(databaseURL, completion) {
  // Download new database zip file
  bungieRequest(databaseURL, function (error, response, body) {
    if (error) {
      console.log("Error downloading zip file: " + error);
      completion(error);
    } else {
      console.log("Completed zip file download request");
    }
  })
  .pipe(unzip.Extract({ path: manifest.bungieDirectory }))
  .on('close', function (src) {
    // Unzip file on write stream close
    console.log("Completed unzipping to " + manifest.bungieDirectory);
    
    completion(null);
  });
}

module.exports = database;
