var Dyno = require('dyno');
var dynamodbTest = require('dynamodb-test');
var test = require('tape');
var tableSpec = require('@mapbox/cardboard/lib/main-table.json');

var mainTable = dynamodbTest(test, 'cardboard-upgrade', tableSpec);

var config = {
  accessKeyId: 'fake',
  secretAccessKey: 'fake',
  mainTable: mainTable.tableName,
  region: 'test',
  endpoint: 'http://localhost:4567'
};

var getRecord = require('./get-record');

mainTable.test('handles insert events', function(assert) {
  var before = getRecord('two-two-zero'); 
  var streamHandler = require('..').streamHandler(config);
  var cardboard = require('@mapbox/cardboard')(config);
  streamHandler(toEvent('INSERT', [before]), function(err) {
    if (err) return assert.end(err, 'stream ran');
    cardboard.get('sandwich', 'test', function(err, fc) {
      if (err) return assert.end(err, 'found feature');
      assert.equal(fc.features.length, 1, 'found feature');
      assert.deepEqual(fc.features[0].geometry.coordinates, [ -71.437894, 43.806338 ], 'right location');
      assert.end();
    });
  });
});

mainTable.test('handles update events', function(assert) {
  var before = getRecord('two-two-zero'); 
  var streamHandler = require('..').streamHandler(config);
  var cardboard = require('@mapbox/cardboard')(config);
  streamHandler(toEvent('MODIFY', [before]), function(err) {
    if (err) return assert.end(err, 'stream ran');
    cardboard.get('sandwich', 'test', function(err, fc) {
      if (err) return assert.end(err, 'found feature');
      assert.equal(fc.features.length, 1, 'found feature');
      assert.deepEqual(fc.features[0].geometry.coordinates, [ -71.437894, 43.806338 ], 'right location');
      assert.end();
    });
  });
});

mainTable.test('handles delete events when nothing is in the db', function(assert) {
  var before = getRecord('two-two-zero'); 
  var streamHandler = require('..').streamHandler(config);
  streamHandler(toEvent('REMOVE', [before]), function(err) {
    assert.ifError(err, 'deletes nothing without throwing an error');
    assert.end();
  });
});

mainTable.test('handles delete events when a feature is in the db', [getRecord('three-zero-zero')], function(assert) {
  var before = getRecord('two-two-zero'); 
  var streamHandler = require('..').streamHandler(config);
  var cardboard = require('@mapbox/cardboard')(config);
  streamHandler(toEvent('REMOVE', [before]), function(err) {
    if (err) return assert.end(err, 'stream ran');
    cardboard.get('sandwich', 'test', function(err, fc) {
      if (err) return assert.end(err, 'found feature');
      assert.equal(fc.features.length, 0, 'feature has been removed');
      assert.end();
    });
  });
});


mainTable.close();

function toEvent(action, records) {
    return {
        Records: records.map(function(mainRecord) {
            var serialized = JSON.parse(Dyno.serialize(mainRecord));
            var record = { eventName: action };
            record.dynamodb = {};
            record.dynamodb.OldImage = action !== 'INSERT' ? serialized : undefined;
            record.dynamodb.NewImage = action !== 'REMOVE' ? serialized : undefined;
            return record;
        })
    };
}

