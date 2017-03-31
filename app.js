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

var db;
var bungieDirectory = [__dirname, "bungieData"].join("/");
var manifestFilePath = [bungieDirectory, "Manifest.json"].join("/");
var tableDefinitions = require('./data');
var middleware = require("./middleware/middleware");
var manifest = require("./data/manifest");
var baseRequest = require("./networking");

// Attempt to find locally cached manifest
var manifestContent = fs.open(manifestFilePath, 'r', function (err, fd) {
  if (err) { 
    manifest.refreshManifest();
  } else {
    console.log("File exists, using file at path \"" + manifestFilePath + "\"");
    fs.readFile(manifestFilePath, 'utf8', (err, data) => {
      if (err) throw err;

      const body = JSON.parse(data);
      manifest.handleUpdatedManifest(body, function (err, dbPath) {

        if (err) {
          console.log("Error handling updated manifest: " + err);
        } else if (dbPath) {
          openDatabase(dbPath);
        } else {
          console.log(manifest);

          var databaseZipURL = manifest.databaseZipURLFromManifest(body);

          console.log(databaseZipURL);
          downloadDatabase(databaseZipURL, function (err) {
            if (err) {
              console.log("Error downloading database: " + err);
            } else {
              // Open up a new database using unzipped file
              var sqlPath = manifest.databasePathFromManifest();
              openDatabase(sqlPath);
            }
          });
        }
      });
    });
  }
});

// manifest.refreshManifest();

// ======================
//        ROUTES
// ======================

app.get("/", function (req, res) {
  res.render("index", {
    paths: Object.keys(tableDefinitions.hashKeys),
    descriptions: tableDefinitions.tableDescriptions,
  });
});

app.get("/:typeHash/:id", middleware.validateTableName, function (req, res) {

  var hashType = req.params.typeHash;

  // "/:typeHash/:id"
  handleTableWithIdResponse(tableDefinitions.tableForHashType(hashType), req, res);
});

app.get("/:typeHash", middleware.validateTableName, function (req, res) {

  var hashType = req.params.typeHash;
  // "/:typeHash/:id"
  handleTableResponse(tableDefinitions.tableForHashType(hashType), hashType, req, res);
});

// DATABASE

function downloadDatabase(databaseURL, completion) {
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
