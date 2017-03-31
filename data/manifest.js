var fs = require('fs');
var manifest = {};

var bungieDirectory = [__dirname, "..", "bungieData"].join("/");
var bungieRequest = require("../networking");
var manifestFilePath = [bungieDirectory, "Manifest.json"].join("/");

manifest.databaseZipURLFromManifest = function(manifestData = this.data) {
  var mobileWorldContentPaths = manifestData.Response.mobileWorldContentPaths.en;

  if (!mobileWorldContentPaths) {
    throw "Expected asset database file not found. Is the manifest empty?";
  }

  return mobileWorldContentPaths;
}

manifest.databasePathFromManifest = function(manifestData = this.data) {
  var mobileWorldContentPaths = this.databaseZipURLFromManifest(manifestData);
  var databaseName = mobileWorldContentPaths.split("/").pop();
  sqlPath = [bungieDirectory, databaseName].join("/");

  return sqlPath;
}

manifest.attemptCachedManifestLoad = function(completion) {
  fs.open(manifestFilePath, 'r', function (err, fd) {
    if (err) { 
      refreshManifest();
    } else {
      console.log("File exists, using file at path \"" + manifestFilePath + "\"");
      fs.readFile(manifestFilePath, 'utf8', (err, data) => {
        if (err) throw err;

        const body = JSON.parse(data);
        manifest.handleUpdatedManifest(body, completion);
      });
    }
  });
};

manifest.refreshManifest = function() {
  // Download manifest
  bungieRequest("/Platform/Destiny/Manifest/", function (error, response, body) {
    var jsonBody = JSON.parse(body);

    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 

    if (error) {
      console.log('error:', error); // Print the error if one occurred 
    } else if (jsonBody.ErrorCode != 1) {
      console.log("Error fetching URL: " + jsonBody.ErrorCode);
      console.log(jsonBody);
    } else {
      // Success downloading manifest
      manifest.saveManifestToDisk(body); // Why?

      manifest.handleUpdatedManifest(jsonBody, function (err, sqlPath) {
        // Do nothing?
      });
    }
  });
}

manifest.handleUpdatedManifest = function(body, completion = null) {
  this.data = body;
  var sqlPath = this.databasePathFromManifest(this.data);
  console.log("Expected database file: " + sqlPath);

  // Check to see if we have that database file on disk
  fs.stat(sqlPath, function(err, stat) {
    if(err == null) {
      console.log('File exists, using existing file "' + sqlPath +'"');
      completion(null, sqlPath);
    } else if(err.code == 'ENOENT') {
      // file does not exist
      // Download new file
      console.log("File does not exist, fetching new file from manifest spec...");
      completion(null, null);
    } else {
      console.log('Some other error: ', err.code);
      completion(err, null);
    }
  });
}

manifest.saveManifestToDisk = function(manifestContent) {
  fs.writeFile(manifestFilePath, manifestContent.toString(), function(err) {

    if(err) {
      console.log(err);
    } else {
      console.log("The file was saved to \""+ manifestFilePath +"\"!");
    }
  });
}

module.exports = manifest;
