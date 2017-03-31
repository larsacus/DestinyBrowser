
const tableDefinitions = require('../data');
var middleware = {};

middleware.validateTableName = function(req, res, next) {
  var hashType = req.params.typeHash;

  if (tableDefinitions.tableForHashType(hashType)) {
    next()
  } else {
    res.send("Unknown table translation for \"" + req.params.typeHash +"\"");
  }
}

module.exports = middleware;