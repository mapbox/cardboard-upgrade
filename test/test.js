var test = require('tape');
var upgrade = require('..');

test('convert two-two-zero to a three-zero-zero record', function(assert) {
  var before = getRecord('two-two-zero');
  var result = upgrade(before);
  var after = getRecord('three-zero-zero');
  Object.keys(after).forEach(function(key) {
    assert.equal(after[key].toString(), result[key].toString(), 'match on '+key);
    delete result[key];
  });
  var left = Object.keys(result);
  assert.equal(left.length, 0, 'no extra keys');
  assert.end();
});

function getRecord(p) {
  var json = require('./feature-'+p+'.json');
  json.val = Buffer.from(json.val.data);
  return json;
}
