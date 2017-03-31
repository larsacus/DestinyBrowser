var sqlite3 = require('sqlite3').verbose();

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

database.handleTableWithIdResponse = function(table, id, fetchCompletion) {
  var sqlStatement = "SELECT * FROM " + table + " WHERE id = " + id + ";";

  console.time(sqlStatement);
  this.db.get(sqlStatement, function (err, row) {

    console.timeEnd(sqlStatement);
    if (err) {
      fetchCompletion(err, null);
    } else if (row) {
      var json = JSON.parse(row.json);
      
      fetchCompletion(null, json);
    } else if (Number(id) > 0) { // This is a hack for when json id's don't match sql column ids
      // Try again with a converted signed hash -(-original >>> 0)
      const convertedId = (-(-Number(id) >>> 0));
      // const redirect = "/" + req.params.typeHash + "/" + );
      // console.log("Redirecting to \"" + redirect + "\"");
      database.handleTableWithIdResponse(table, convertedId, fetchCompletion);
    } else {
      fetchCompletion('No rows found for "' + sqlStatement + '"', null);
    }
  });
}

database.handleTableResponse = function(table, hashType, limit, offset, rowFetchCompletion) {
  var sqlStatements = [
      "SELECT * FROM " + table,
      ];

  if (limit) {
    sqlStatements.push("LIMIT " + limit);
  } 

  if (offset) {
    sqlStatements.push("OFFSET " + offset);
  }

  var sqlStatement = sqlStatements.join(" ") + ";";
  console.log("Executing SQL: \"" + sqlStatement + "\"");

  console.time(sqlStatement);
  this.db.all(sqlStatement, function (err, rows) {
    var rowsJSON = [];

    if (!err) {

      rows.forEach(function (row) {
        var json = JSON.parse(row.json);
        rowsJSON.push(json);
      });

      console.timeEnd(sqlStatement);
    }

    rowFetchCompletion(err, rowsJSON);
  });
}

module.exports = database;