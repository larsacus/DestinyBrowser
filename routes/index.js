var express = require("express");
var router = express.Router();
const tableDefinitions = require("../data");
const middleware = require("../middleware");

module.exports = function (database) {

  router.get("/", function (req, res) {
    res.render("index", {
      paths: Object.keys(tableDefinitions.hashKeys),
      descriptions: tableDefinitions.tableDescriptions,
    });
  });

  router.get("/:typeHash/:id", middleware.validateTableName, function (req, res) {

    var hashType = req.params.typeHash;

    // "/:typeHash/:id"
    database.handleTableWithIdResponse(tableDefinitions.tableForHashType(hashType), req, res);
  });

  router.get("/:typeHash", middleware.validateTableName, function (req, res) {

    var hashType = req.params.typeHash;
    // "/:typeHash/:id"
    database.handleTableResponse(tableDefinitions.tableForHashType(hashType), hashType, req, res);
  });

  return router;
}
