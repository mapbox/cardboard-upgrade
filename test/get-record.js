var fs = require('fs');
var path = require('path');

module.exports = function getRecord(p) {
  var str = fs.readFileSync(path.join(__dirname, 'feature-'+p+'.json'));
  var json = JSON.parse(str);
  json.val = Buffer.from(json.val.data);
  return json;
}

