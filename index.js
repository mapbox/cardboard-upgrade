var Dyno = require('dyno');
var zeroTwoFive = require('geobuf-zero-two-five');
var threeZeroZero = require('geobuf-three-zero-zero');
var Pbf = require('pbf');
var utils = require('cardboard/lib/utils');
var streamHelper = require('cardboard').streamHelper;

var convert = module.exports = function(record) {
  var out = utils.createFeatureKey(record.dataset, record.id.replace('id!', ''));

  var feature = zeroTwoFive.geobufToFeature(record.val);

  out.val = Buffer.from(threeZeroZero.encode(feature, new Pbf()));
  out.size = out.val.length;

  return out;
};

module.exports.streamHandler = function(config) {

  var dyno = Dyno({table: config.mainTable, region: config.region, endpoint: config.endpoint});

  return streamHelper(['INSERT', 'REMOVE', 'MODIFY'], function(records, callback) {
    var requestItems = records.map(function(change) {
      if (change.action === 'REMOVE') {
        return {
          DeleteRequest: {
            Key: {
              key: convert(change.before).key
            }
          }
        }
      }

      return {
        PutRequest: {
          Item: convert(change.after) 
        }
      };
    });
    
    if (requestItems.length === 0) return setTimeout(callback, 0);

    var params = { RequestItems: {} };
    params.RequestItems[config.mainTable] = requestItems;

    dyno.batchWriteAll(params).sendAll(10, function(err, res) {
      if (err) console.log(err);
      if (err) return callback(err);
      if (res.UnprocessedItems.length > 0) return callback(new Error('Not all records were written'));
      callback();
    });

  });
}
