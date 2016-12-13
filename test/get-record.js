var bufferFrom = require('buffer-from');
var fs = require('fs');
var path = require('path');

module.exports = function getRecord(p) {
  var str = fs.readFileSync(path.join(__dirname, 'feature-'+p+'.json'));
  var json = JSON.parse(str);
  json.val = bufferFrom(json.val.data);
  return json;
}

