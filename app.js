var express = require("express"),
    bodyParser = require("body-parser"),
    app = express();

// =========================
//      EXPRESS CONFIG
// =========================

// Use 'body-parser' middleware to decode POST bodies
app.use(bodyParser.urlencoded({
  extended: true
}));

var tableDefinitions = require("./data");

app.use(function(req, res, next) {
  res.locals.descriptions = tableDefinitions.tableDescriptions;
  res.locals.paths = Object.keys(tableDefinitions.hashKeys);
  next();
});

// Use 'ejs' as the default rendering engine
app.set("view engine", "ejs");

// Utilize 'public' directory
app.use(express.static(__dirname + "/public"));

var manifest = require("./data/manifest");
var database = require("./data/database");
var genericRoutes = require("./routes")(database);
var databaseRequest = require("./networking/database");

// Force download a remote manifest
// manifest.refreshManifest();

// Attempt to find locally cached manifest
manifest.attemptCachedManifestLoad(function (err, dbPath) {
  if (err) {
    console.log("Error handling updated manifest: " + err);
  } else if (dbPath) {
    console.log("Attempting to open existing database at path: " + dbPath);
    database.openDatabase(dbPath);
  } else {
    console.log(manifest);

    var databaseZipURL = manifest.databaseZipURLFromManifest();

    console.log(databaseZipURL);
    databaseRequest.downloadDatabase(databaseZipURL, function (err) {
      if (err) {
        console.log("Error downloading database: " + err);
      } else {
        // Open up a new database using unzipped file
        var sqlPath = manifest.databasePathFromManifest();
        database.openDatabase(sqlPath);
      }
    });
  }
});

// ======================
//        ROUTES
// ======================
app.use(genericRoutes);

// =========================
//      START SERVER
// =========================
// app.listen(process.env.PORT, process.env.IP, function() {
app.listen(3000, function() {
  console.log("Destiny Explorer Server Initialized at localhost:3000!");
});
