var Lib = require('../src');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

exports['should be able to shift array'] = function (test) {
  var lib = Lib({
    foo: ['foo', 'bar']
  });
  lib.shift('foo');
  test.deepEqual(lib.get(), {foo: ['bar']});
  test.done();
};

exports['should be able to shift values and remove any references'] = function (test) {
  var obj = {foo: 'bar'};
  var lib = Lib({
    foo: [obj]
  });
  lib.shift('foo');
  test.ok(!obj['.referencePaths']);
  test.done();
};

exports['should show what changed'] = function (test) {
  var lib = Lib({
    foo: ['foo']
  });
  lib.shift('foo');
  test.deepEqual(lib.flushChanges(), { foo: { 0: true } });
  test.done();
};
