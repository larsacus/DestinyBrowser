var express = require("express"),
    bodyParser = require("body-parser"),
    request = require("request"),
    fs = require("fs"),
    unzip = require("unzip"),
    sqlite3 = require('sqlite3').verbose(),
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

app.get("/", function (req, res) {
  res.send("This is the index");
});

var baseURL = "https://www.bungie.net";
var db;

// Config `request` package defaults
var baseRequest = request.defaults({
  baseUrl: baseURL
});

var bungieDirectory = [__dirname, "bungieData"].join("/");
var manifestFilePath = [bungieDirectory, "Manifest.json"].join("/");
var sqlPath;

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
      console.log("The file was saved to \""+ path +"\"!");
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

var hashKeys = {
  bundleHash: "DestinyActivityBundleDefinition", // [activityBundleHashes]
  activityHash: "DestinyActivityDefinition", // [activityHashes]
  activityTypeHash: "DestinyActivityTypeDefinition",
  classHash: "DestinyClassDefinition",                   
  combatantHash: "DestinyCombatantDefinition",                   
  damageTypeHash: "DestinyDamageTypeDefinition",            
  destinationHash: "DestinyDestinationDefinition",
  directorBookHash: "DestinyDirectorBookDefinition",  //bookHash (internally)
  raceHash: "DestinyEnemyRaceDefinition",             
  factionHash: "DestinyFactionDefinition",                       
  genderHash: "DestinyGenderDefinition",                   
  tierHash: "DestinyMedalTierDefinition", // Unknown if correct hash key
  bucketHash: "DestinyInventoryBucketDefinition",     
  itemHash: "DestinyInventoryItemDefinition",               
  itemCategoryHash: "DestinyItemCategoryDefinition", // [itemCategoryHashes]
  locationHash: "DestinyLocationDefinition",
  objectiveHash: "DestinyObjectiveDefinition",
  placeHash: "DestinyPlaceDefinition",
  progressionHash: "DestinyProgressionDefinition",
  raceHash: "DestinyRaceDefinition",
  recordHash: "DestinyRecordDefinition",
  sourceHash: "DestinyRewardSourceDefinition", // [sourceHashes]
  perkHash: "DestinySandboxPerkDefinition",
  skullHash: "DestinyScriptedSkullDefinition",
  eventHash: "DestinySpecialEventDefinition",
  statHash: "DestinyStatDefinition",
  statGroupHash: "DestinyStatGroupDefinition",
  talentGridHash: "DestinyTalentGridDefinition",
  triumphSetHash: "DestinyTriumphSetDefinition",
  flagHash: "DestinyUnlockFlagDefinition", // unlockFlagHash
  categoryHash: "DestinyVendorCategoryDefinition",
  vendorHash: "DestinyVendorDefinition",
};

app.get("/:typeHash/:id", function (req, res) {

  // "/:typeHash/:id"
  var hashType = req.params.typeHash;
  console.log("type: " + hashType);

  var table = hashKeys[hashType];
  console.log("table: " + table);

  var sqlStatement = "SELECT * FROM " + table + " WHERE id = " + req.params.id + ";";

  db.get(sqlStatement, function (err, row) {
    if (err) {
      console.log("Error: " + err);
    } else {
      var json = JSON.parse(row.json);
      var jsonString = JSON.stringify(json);
      
      res.send(jsonString); 
    }
  });

  
});


// : "DestinyActivityCategoryDefinition", // What is "parentHashes"?
// : "DestinyActivityModeDefinition",  
// : "DestinyBondDefinition", 
// : "DestinyGrimoireCardDefinition",            
// : "DestinyGrimoireDefinition",                
// : "DestinyHistoricalStatsDefinition", // pretty sure only usable with user data
// : "DestinyRecordBookDefinition",


// Unknown:
//   questItemHashes
//   nodeDefinitionHash -- from DestinyDirectorBookDefinition.nodes
//   styleHash -- from DestinyDirectorBookDefinition.nodes
//   flagHash -- DestinyDirectorBookDefinition.isVisibleExpression.steps
//   bucketTypeHash -- DestinyInventoryItemDefinition
//   primaryBaseStatHash -- DestinyInventoryItemDefinition
//   perkHashes -- DestinyInventoryItemDefinition
//   channelHash -- DestinyInventoryItemDefinition.equippingBlock.defaultDyes
//   dyeHash -- DestinyInventoryItemDefinition.equippingBlock.defaultDyes
//   flagHash -- DestinyInventoryItemDefinition.customDyeExpression.steps
//   valueHash -- DestinyInventoryItemDefinition.customDyeExpression.steps
//   weaponPatternHash -- DestinyInventoryItemDefinition
//   equipmentSlotHash -- DestinyInventoryItemDefinition
//   rewardItemHash -- DestinyInventoryItemDefinition
//   setItemHashes -- DestinyInventoryItemDefinition
//   questlineItemHash -- DestinyInventoryItemDefinition
//   uniquenessHash -- DestinyInventoryItemDefinition
//   activityGraphHash -- DestinyLocationDefinition
//   activityGraphNodeHash -- DestinyLocationDefinition
//   unlockValueHash -- DestinyObjectiveDefinition
//   bountyHashes -- DestinySpecialEventDefinition
//   questHashes -- DestinySpecialEventDefinition

// Some IDs don't match the id column in the database -- these are outdated or deprecated objects


// =========================
//      START SERVER
// =========================
// app.listen(process.env.PORT, process.env.IP, function() {
app.listen(3000, function() {
  console.log("Destiny Explorer Server Initialized at localhost:3000!");
});
