var request = require('request');

var baseURL = "https://www.bungie.net";

// Config `request` package defaults
module.exports = request.defaults({
  baseUrl: baseURL,
  headers: {
    'X-API-Key': process.env.API_KEY,
  }
});
