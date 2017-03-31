var unzip = require("unzip");

var database = {};

database.downloadDatabase = function(databaseURL, completion) {
  // Download new database zip file
  baseRequest(databaseURL, function (error, response, body) {
    if (error) {
      console.log("Error downloading zip file: " + error);
      completion(error);
    } else {
      console.log("Completed zip file download request");
    }
  })
  .pipe(unzip.Extract({ path: bungieDirectory }))
  .on('close', function (src) {
    // Unzip file on write stream close
    console.log("Completed unzipping to " + bungieDirectory);
    
    completion(null);
  });
}

module.exports = database;
