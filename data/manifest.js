var fs = require('fs');
var manifest = {};

var bungieRequest = require("../networking");

manifest.bungieDirectory = [__dirname, "..", "bungieData"].join("/");
manifest.manifestFilePath = [manifest.bungieDirectory, "Manifest.json"].join("/");

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
  sqlPath = [this.bungieDirectory, databaseName].join("/");

  return sqlPath;
}

manifest.attemptCachedManifestLoad = function(completion) {
  fs.open(this.manifestFilePath, 'r', function (err, fd) {
    if (err) { 
      manifest.refreshManifest(completion);
    } else {
      console.log("File exists, using file at path \"" + manifest.manifestFilePath + "\"");
      fs.readFile(manifest.manifestFilePath, 'utf8', (err, data) => {
        if (err) throw err;

        const body = JSON.parse(data);
        manifest.handleUpdatedManifest(body, completion);
      });
    }
  });
};

manifest.refreshManifest = function(completion) {
  // Download manifest
  bungieRequest("/Platform/Destiny/Manifest/", function (error, response, body) {
    var jsonBody = JSON.parse(body);

    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 

    if (error) {
      console.log('error:', error); // Print the error if one occurred 
    } else if (jsonBody.ErrorCode != 1) {
      console.log(jsonBody);
      throw ("Error fetching URL: " + jsonBody.ErrorCode);
    } else {
      // Success downloading manifest
      manifest.saveManifestToDisk(body, function (err) {
        if (err) { console.log("Error saving manifest to disk... " + err);}
        manifest.handleUpdatedManifest(jsonBody, function (err, sqlPath) {
          if (err) {
            console.log("Error fetching updated manifest: " + err);
          } else if (sqlPath) {
            console.log("Found updated manifest! Loading db...")
          } else {
            console.log("Did not find SQL database file and there was no error. Need to download...");
          }

          completion(err, sqlPath);
        });
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
      console.log("File does not exist...");
      completion(null, null);
    } else {
      console.log('Some other error: ', err.code);
      completion(err, null);
    }
  });
}

manifest.saveManifestToDisk = function(manifestContent, completion) {
  console.log("Writing file to disk at: " + this.manifestFilePath);

  fs.writeFile(this.manifestFilePath, manifestContent.toString(), function(err) {

    if(err) {
      console.log(err);
    } else {
      console.log("The file was saved to \""+ manifest.manifestFilePath +"\"!");
    }

    completion(err);
  });
}

module.exports = manifest;
