var express = require("express");
var router = express.Router();
var url = require('url'); // built-in utility

const tableDefinitions = require("../data");
const middleware = require("../middleware");
const tailoredHashPages = [
  "activityHash",
];

module.exports = function (database) {

  router.get("/", function (req, res) {
    res.render("index", {
      paths: Object.keys(tableDefinitions.hashKeys),
    });
  });

  router.get("/:typeHash/:id", middleware.validateTableName, function (req, res) {

    const hashType = req.params.typeHash;
    const table = tableDefinitions.tableForHashType(hashType)
    const objectId = req.params.id;

    // "/:typeHash/:id"
    database.handleTableWithIdResponse(table, objectId, function (err, obj) {
      if (tailoredHashPages.includes(hashType)) {
        res.render(hashType, {
          item: obj,
        });
      } else {
        var jsonString = JSON.stringify(obj);
        res.send(jsonString);
      }
    });
  });

  router.get("/:typeHash", middleware.validateTableName, function (req, res) {

    const hashType = req.params.typeHash;
    const table = tableDefinitions.tableForHashType(hashType)
    const limit = req.query.limit;
    const offset = req.query.offset;

    if (!limit) {
      res.redirect(req.url + "?limit=24");
      return;
    }

    // "/:typeHash/:id"
    database.handleTableResponse(table, hashType, limit, offset, function (err, rows) {
      if (err) {
        console.log("Error fetching table: " + err);
        res.send(500, "Error fetching table: " + err);
      } else {
        console.log(url.parse(req.url).pathname);
        
        res.render("genericList", {
          table: table,
          items: rows,
          offset: offset,
          limit: limit,
          hashType: hashType,
          pageUrl: url.parse(req.url).pathname,
          resourceType: url.parse(req.url).pathname.split("/").filter((item)=>{return item.length >0})[0].replace("Hash", ""),
        }); 
      }
    });
  });

  return router;
}
