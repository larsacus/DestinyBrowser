var request = require('request');

var baseURL = "https://www.bungie.net";

// Config `request` package defaults
module.exports = request.defaults({
  baseUrl: baseURL
});
