var zeroTwoFive = require('geobuf-zero-two-five');
var threeZeroZero = require('geobuf-three-zero-zero');
var Pbf = require('pbf');

module.exports = function(record) {
  var out = {
    key: record.dataset+'!feature!'+record.id.replace('id!', '')
  };

  var feature = zeroTwoFive.geobufToFeature(record.val);

  out.val = Buffer.from(threeZeroZero.encode(feature, new Pbf()));
  out.size = out.val.length;

  return out;
}
