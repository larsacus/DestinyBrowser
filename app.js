var express = require("express"),
    bodyParser = require("body-parser"),
    request = require("request"),
    fs = require("fs"),
    unzip = require("unzip"),
    sqlite3 = require('sqlite3').verbose(),
    app = express();

var db;

// =========================
//      EXPRESS CONFIG
// =========================

// Use 'body-parser' middleware to decode POST bodies
app.use(bodyParser.urlencoded({
  extended: true
}));

// Use 'ejs' as the default rendering engine
app.set("view engine", "ejs");

// Utilize 'public' directory
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.send("This is the index");
});

var baseURL = "https://www.bungie.net";

// Config `request` package defaults
var baseRequest = request.defaults({
  baseUrl: baseURL
});

var bungieDirectory = "bungieData";
var sqlPath;

var manifestContent = fs.open(manifestFilePath(), 'r', function (err, fd) {
  if (err) { 
    refreshManifest();
  } else {
    console.log("File exists, using file at path \"" + manifestFilePath() + "\"");
    fs.readFile(manifestFilePath(), 'utf8', (err, data) => {
      if (err) throw err;

      handleUpdatedManifest(JSON.parse(data));
    });
  }
});

function databaseZipURLFromManifest(manifestData) {
  var mobileWorldContentPaths = manifestData.Response.mobileWorldContentPaths.en;

  return mobileWorldContentPaths;
}

function databasePathFromManifest(manifestData) {
  var mobileWorldContentPaths = databaseZipURLFromManifest(manifestData);
  var databaseName = mobileWorldContentPaths.split("/").pop();
  sqlPath = [bungieDirectory, databaseName].join("/");

  return sqlPath;
}

function refreshManifest() {
  // Download manifest
  baseRequest("/Platform/Destiny/Manifest/", function (error, response, body) {
    var jsonBody = JSON.parse(body);

    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 

    if (error) {
      console.log('error:', error); // Print the error if one occurred 
    } else if (jsonBody.ErrorCode != 1) {
      console.log("Error fetching URL: " + jsonBody.ErrorCode);
      console.log(jsonBody);
    } else {
      // Success downloading manifest
      console.log('body:', jsonBody);

      saveManifestToDisk(body); // Why?

      handleUpdatedManifest(jsonBody);
    }
  });
}

function handleUpdatedManifest(body) {
  var databaseZipURL = databaseZipURLFromManifest(body);
  sqlPath = databasePathFromManifest(body);
  console.log("Expected database file: " + sqlPath);

  fs.stat(sqlPath, function(err, stat) {
    if(err == null) {
      console.log('File exists, using existing file "' + sqlPath +'"');
      openDatabase(sqlPath);
    } else if(err.code == 'ENOENT') {
      // file does not exist
      // Download new file
      console.log("File does not exist, fetching new file from manifest spec...");
      downloadDatabase(databaseZipURL);
    } else {
      console.log('Some other error: ', err.code);
    }
  });
}

function manifestFilePath() {
  return [bungieDirectory, "Manifest.json"].join("/");
}

function saveManifestToDisk(manifestContent) {
  var path = manifestFilePath();
  fs.writeFile(path, manifestContent.toString(), function(err) {

    if(err) {
        return console.log(err);
    }

    console.log("The file was saved to \""+ path +"\"!");
  });
}

function downloadDatabase(databaseURL) {
  // Download new database zip file
    baseRequest(databaseURL, function (error, response, body) {
      if (error) {
        console.log("Error downloading zip file: " + error);
      } else {
        console.log("Completed zip file download request");
      }
    })
    .pipe(unzip.Extract({ path: bungieDirectory }))
    .on('close', function (src) {
      // Unzip file on write stream close
      console.log("Completed unzipping to " + bungieDirectory);

      // Open up a new database using unzipped file
      openDatabase(sqlPath);
    });
}

function databaseTempZipPath() {
  return [bungieDirectory, "database.zip"].join("/");
}

function openDatabase(sqlPath) {
  console.log("Path of SQL database: " + sqlPath);
  db = new sqlite3.Database(sqlPath, sqlite3.OPEN_READONLY, function (dbErr) {

    if (dbErr) {
      console.log("Error opening database: " + dbErr);
    } else {
      console.log("Successfully opened database!");
    }
    // db.each("SELECT * FROM DestinyActivityBundleDefinition", function(err, row) {
    //     console.log(row.id + ": " + JSON.stringify(JSON.parse(row.json)));
    // });
   
    db.close();
  });
}

// // =========================
// //      START SERVER
// // =========================
// // app.listen(process.env.PORT, process.env.IP, function() {
// app.listen(3000, function() {
//   console.log("YelpCamp Server Initialized!");
// });
