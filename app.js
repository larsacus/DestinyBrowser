var express = require("express"),
    bodyParser = require("body-parser"),
    request = require("request"),
    fs = require("fs"),
    unzip = require("unzip"),
    sqlite3 = require('sqlite3').verbose(),
    url = require('url'), // built-in utility
    app = express();

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

// Config `request` package defaults
var baseRequest = request.defaults({
  baseUrl: baseURL
});

var baseURL = "https://www.bungie.net";
var db;
var bungieDirectory = [__dirname, "bungieData"].join("/");
var manifestFilePath = [bungieDirectory, "Manifest.json"].join("/");
var sqlPath;
var tableDefinitions = require('./data');

// Attempt to find locally cached manifest
var manifestContent = fs.open(manifestFilePath, 'r', function (err, fd) {
  if (err) { 
    refreshManifest();
  } else {
    console.log("File exists, using file at path \"" + manifestFilePath + "\"");
    fs.readFile(manifestFilePath, 'utf8', (err, data) => {
      if (err) throw err;

      handleUpdatedManifest(JSON.parse(data));
    });
  }
});

// refreshManifest();

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

function handleUpdatedManifest(body) {
  var databaseZipURL = databaseZipURLFromManifest(body);
  sqlPath = databasePathFromManifest(body);
  console.log("Expected database file: " + sqlPath);

  // Check to see if we have that database file on disk
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

function saveManifestToDisk(manifestContent) {
  fs.writeFile(manifestFilePath, manifestContent.toString(), function(err) {

    if(err) {
      console.log(err);
    } else {
      console.log("The file was saved to \""+ manifestFilePath +"\"!");
    }
  });
}

function openDatabase(sqlPath) {
  console.log("Path of SQL database: " + sqlPath);
  db = new sqlite3.Database(sqlPath, sqlite3.OPEN_READONLY, function (dbErr) {

    if (dbErr) {
      console.log("Error opening database: " + dbErr);
    } else {
      console.log("Successfully opened database!");
    }

    var rows = [];
    // db.each("SELECT * FROM DestinyActivityBundleDefinition", function(err, row) {
    //     console.log(row.id + ": " + JSON.stringify(JSON.parse(row.json)));
    // });
   
    // db.close();
  });
}

app.get("/", function (req, res) {
  res.render("index", {
    paths: Object.keys(tableDefinitions.hashKeys),
    descriptions: tableDefinitions.tableDescriptions,
  });
});

app.get("/:typeHash/:id", validateTableName, function (req, res) {

  var hashType = req.params.typeHash;

  // "/:typeHash/:id"
  handleTableWithIdResponse(tableDefinitions.tableForHashType(hashType), req, res);
});

app.get("/:typeHash", validateTableName, function (req, res) {

  var hashType = req.params.typeHash;
  // "/:typeHash/:id"
  handleTableResponse(tableDefinitions.tableForHashType(hashType), hashType, req, res);
});

function validateTableName(req, res, next) {
  var hashType = req.params.typeHash;

  if (tableDefinitions.tableForHashType(hashType)) {
    next()
  } else {
    res.send("Unknown table translation for \"" + req.params.typeHash +"\"");
  }
}

function handleTableWithIdResponse(table, req, res) {
  var sqlStatement = "SELECT * FROM " + table + " WHERE id = " + req.params.id + ";";

    console.time(sqlStatement);
    db.get(sqlStatement, function (err, row) {

      console.timeEnd(sqlStatement);
      if (err) {
        console.log("Error: " + err);
        res.send("Error: " + err);
      } else if (row) {
        var json = JSON.parse(row.json);
        var jsonString = JSON.stringify(json);

        res.send(jsonString);
      } else if (Number(req.params.id) > 0) { // This is a hack for when json id's don't match sql column ids
        // Try again with a converted signed hash -(-original >>> 0)
        const redirect = "/" + req.params.typeHash + "/" + (-(-Number(req.params.id) >>> 0));
        console.log("Redirecting to \"" + redirect + "\"");
        res.redirect(redirect);
      } else {
        res.send("No rows found for \"" + sqlStatement + "\"");
      }
    });
}

function handleTableResponse(table, hashType, req, res) {
  var sqlStatements = [
      "SELECT * FROM " + table,
      // "WHERE id > 0",
    ];

    if (req.query.limit) {
      sqlStatements.push("LIMIT " + req.query.limit);
    } else {
      res.redirect(req.url + "?limit=25");
      return;
    }

    if (req.query.offset) {
      sqlStatements.push("OFFSET " + req.query.offset);
    }

    var sqlStatement = sqlStatements.join(" ") + ";";
    console.log("Executing SQL: \"" + sqlStatement + "\"");

    console.time(sqlStatement);
    db.all(sqlStatement, function (err, rows) {
      if (err) {
        console.log("Error: " + err);
        res.send("Error: " + err);
      } else {

        var rowsJSON = [];
        rows.forEach(function (row) {
          var json = JSON.parse(row.json);
          // var jsonString = JSON.stringify(json);
          json.sqlId = row.id;
          rowsJSON.push(json);
        });

        console.timeEnd(sqlStatement);

        console.log(url.parse(req.url).pathname);
        
        res.render("genericList", {
          table: table,
          items: rowsJSON,
          offset: req.query.offset,
          limit: req.query.limit,
          hashType: hashType,
          pageUrl: url.parse(req.url).pathname,
          resourceType: url.parse(req.url).pathname.split("/").filter((item)=>{return item.length >0})[0].replace("Hash", ""),
          descriptions: tableDefinitions.tableDescriptions,
        }); 
      }
    });
}

// =========================
//      START SERVER
// =========================
// app.listen(process.env.PORT, process.env.IP, function() {
app.listen(3000, function() {
  console.log("Destiny Explorer Server Initialized at localhost:3000!");
});
