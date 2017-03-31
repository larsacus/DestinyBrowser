var sqlite3 = require('sqlite3').verbose();
var url = require('url'); // built-in utility

var tableDefinitions = require(".");

var database = {};

database.openDatabase = function(sqlPath) {
  console.log("Path of SQL database: " + sqlPath);
  this.db = new sqlite3.Database(sqlPath, sqlite3.OPEN_READONLY, function (dbErr) {

    if (dbErr) {
      console.log("Error opening database: " + dbErr);
    } else {
      console.log("Successfully opened database!");
    }
  });
}

database.handleTableWithIdResponse = function(table, req, res) {
  var sqlStatement = "SELECT * FROM " + table + " WHERE id = " + req.params.id + ";";

  console.time(sqlStatement);
  this.db.get(sqlStatement, function (err, row) {

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

database.handleTableResponse = function(table, hashType, req, res) {
  var sqlStatements = [
      "SELECT * FROM " + table,
      ];

  if (req.query.limit) {
    sqlStatements.push("LIMIT " + req.query.limit);
  } else {
    res.redirect(req.url + "?limit=24");
    return;
  }

  if (req.query.offset) {
    sqlStatements.push("OFFSET " + req.query.offset);
  }

  var sqlStatement = sqlStatements.join(" ") + ";";
  console.log("Executing SQL: \"" + sqlStatement + "\"");

  console.time(sqlStatement);
  this.db.all(sqlStatement, function (err, rows) {
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

module.exports = database;