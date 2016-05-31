var Lib = require('../src');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

exports['should be able to pop array'] = function (test) {
  var lib = Lib({
    foo: ['foo', 'bar']
  });
  lib.pop('foo');
  test.deepEqual(lib.get(), {foo: ['foo']});
  test.done();
};

exports['should be able to pop values and remove any references'] = function (test) {
  var obj = {foo: 'bar'};
  var lib = Lib({
    foo: [obj]
  });
  lib.pop('foo');
  test.ok(!obj['.referencePaths']);
  test.done();
};

exports['should show what changed'] = function (test) {
  var lib = Lib({
    foo: ['foo']
  });
  lib.pop('foo');
  test.deepEqual(lib.flushChanges(), { foo: { 0: true } });
  test.done();
};
